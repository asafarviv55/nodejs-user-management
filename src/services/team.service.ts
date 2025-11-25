import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TeamRole } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(ownerId: number, data: { name: string; description?: string }) {
    const slug = this.generateSlug(data.name);

    const existingTeam = await this.prisma.team.findUnique({ where: { slug } });
    if (existingTeam) {
      throw new BadRequestException('Team with this name already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          ownerId,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: ownerId,
          role: TeamRole.OWNER,
        },
      });

      return team;
    });
  }

  async getTeam(teamId: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, username: true, profile: true },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async getUserTeams(userId: number) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.team,
      memberCount: m.team._count.members,
      myRole: m.role,
    }));
  }

  async updateTeam(teamId: number, userId: number, data: { name?: string; description?: string }) {
    await this.verifyTeamAdmin(teamId, userId);

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = this.generateSlug(data.name);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });
  }

  async addMember(teamId: number, userId: number, targetUserId: number, role: TeamRole = TeamRole.MEMBER) {
    await this.verifyTeamAdmin(teamId, userId);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { _count: { select: { members: true } } },
    });

    if (team._count.members >= team.maxMembers) {
      throw new BadRequestException('Team has reached maximum member limit');
    }

    const existingMember = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a team member');
    }

    return this.prisma.teamMember.create({
      data: { teamId, userId: targetUserId, role },
      include: { user: { select: { id: true, email: true, username: true } } },
    });
  }

  async updateMemberRole(teamId: number, userId: number, targetUserId: number, newRole: TeamRole) {
    await this.verifyTeamOwner(teamId, userId);

    if (newRole === TeamRole.OWNER) {
      throw new BadRequestException('Cannot assign owner role directly. Use transfer ownership.');
    }

    return this.prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId: targetUserId } },
      data: { role: newRole },
    });
  }

  async removeMember(teamId: number, userId: number, targetUserId: number) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === TeamRole.OWNER) {
      throw new BadRequestException('Cannot remove team owner');
    }

    if (userId !== targetUserId) {
      await this.verifyTeamAdmin(teamId, userId);
    }

    await this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });
  }

  async transferOwnership(teamId: number, currentOwnerId: number, newOwnerId: number) {
    await this.verifyTeamOwner(teamId, currentOwnerId);

    const newOwnerMembership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: newOwnerId } },
    });

    if (!newOwnerMembership) {
      throw new BadRequestException('New owner must be a team member');
    }

    await this.prisma.$transaction([
      this.prisma.teamMember.update({
        where: { teamId_userId: { teamId, userId: currentOwnerId } },
        data: { role: TeamRole.ADMIN },
      }),
      this.prisma.teamMember.update({
        where: { teamId_userId: { teamId, userId: newOwnerId } },
        data: { role: TeamRole.OWNER },
      }),
      this.prisma.team.update({
        where: { id: teamId },
        data: { ownerId: newOwnerId },
      }),
    ]);
  }

  async deleteTeam(teamId: number, userId: number) {
    await this.verifyTeamOwner(teamId, userId);
    await this.prisma.team.delete({ where: { id: teamId } });
  }

  private async verifyTeamAdmin(teamId: number, userId: number) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (!membership || ![TeamRole.OWNER, TeamRole.ADMIN].includes(membership.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
  }

  private async verifyTeamOwner(teamId: number, userId: number) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (!membership || membership.role !== TeamRole.OWNER) {
      throw new ForbiddenException('Only team owner can perform this action');
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
