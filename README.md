# User Management API

A secure, production-ready REST API for user management built with NestJS, Prisma, and TypeScript.

## Features

- User registration and authentication (JWT)
- Secure password hashing with bcrypt
- Input validation with class-validator
- Environment configuration with validation
- MySQL database with Prisma ORM
- Docker support for easy deployment
- Health check endpoint
- **Swagger/OpenAPI documentation**
- **Rate limiting protection**
- **Security headers with Helmet.js**
- **Structured logging with Winston**
- **Global exception handling**
- **Graceful shutdown support**

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: MySQL 8
- **ORM**: Prisma 5
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js 18+
- MySQL 8+ (or Docker)
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/asafarviv55/nodejs-user-management.git
cd nodejs-user-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 3001 |
| `DATABASE_URL` | MySQL connection string | - |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 10d |

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# With Docker
docker-compose up -d
```

## API Documentation

Interactive API documentation is available at:
```
http://localhost:3001/api/docs
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Users (Protected - requires JWT)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

## Request Examples

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "username": "johndoe",
    "roleId": 1
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Get Users (Protected)
```bash
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
src/
├── config/          # Configuration and validation
├── controllers/     # Route handlers
├── dto/             # Data Transfer Objects
├── filters/         # Exception filters
├── guards/          # Authentication guards
├── services/        # Business logic
└── main.ts          # Application entry point
```

## Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **Rate Limiting**: Protects against brute-force attacks (100 req/min)
- **bcrypt**: Secure password hashing with salt rounds
- **JWT**: Stateless authentication with configurable expiry
- **Input Validation**: Strict validation with class-validator
- **CORS**: Configurable cross-origin resource sharing

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start in development mode |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## License

MIT
