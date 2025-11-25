import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { InvitationStatus, TeamRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private readonly prisma: PrismaService) {}

  async sendInvitation(
    senderId: number,
    email: string,
    teamId?: number,
    role: TeamRole = TeamRole.MEMBER,
    message?: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (teamId) {
      if (existingUser) {
        const existingMember = await this.prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId, userId: existingUser.id } },
        });
        if (existingMember) {
          throw new BadRequestException('User is already a team member');
        }
      }

      const pendingInvitation = await this.prisma.invitation.findFirst({
        where: {
          email,
          teamId,
          status: InvitationStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingInvitation) {
        throw new BadRequestException('A pending invitation already exists for this email');
      }
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.prisma.invitation.create({
      data: {
        email,
        token,
        teamId,
        senderId,
        role,
        message,
        expiresAt,
      },
      include: {
        team: { select: { id: true, name: true } },
        sender: { select: { id: true, email: true, username: true } },
      },
    });

    // In production, send email here
    return {
      ...invitation,
      inviteLink: `/invitations/accept/${token}`,
    };
  }

  async getInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        team: { select: { id: true, name: true, description: true } },
        sender: { select: { id: true, email: true, username: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: number) {
    const invitation = await this.getInvitation(token);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.email !== invitation.email) {
      throw new BadRequestException('This invitation was sent to a different email address');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
      });

      if (invitation.teamId) {
        await tx.teamMember.create({
          data: {
            teamId: invitation.teamId,
            userId,
            role: invitation.role,
          },
        });
      }
    });

    return { message: 'Invitation accepted successfully' };
  }

  async declineInvitation(token: string) {
    const invitation = await this.getInvitation(token);

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.DECLINED },
    });

    return { message: 'Invitation declined' };
  }

  async cancelInvitation(invitationId: number, userId: number) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.senderId !== userId) {
      throw new BadRequestException('You can only cancel your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELLED },
    });

    return { message: 'Invitation cancelled' };
  }

  async resendInvitation(invitationId: number, userId: number) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.senderId !== userId) {
      throw new BadRequestException('You can only resend your own invitations');
    }

    const newToken = randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async getSentInvitations(userId: number, status?: InvitationStatus) {
    return this.prisma.invitation.findMany({
      where: {
        senderId: userId,
        ...(status && { status }),
      },
      include: {
        team: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingInvitationsForEmail(email: string) {
    return this.prisma.invitation.findMany({
      where: {
        email,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        team: { select: { id: true, name: true, description: true } },
        sender: { select: { id: true, email: true, username: true } },
      },
    });
  }

  async getTeamInvitations(teamId: number, status?: InvitationStatus) {
    return this.prisma.invitation.findMany({
      where: {
        teamId,
        ...(status && { status }),
      },
      include: {
        sender: { select: { id: true, email: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
