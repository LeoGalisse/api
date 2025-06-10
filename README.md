# Inatel Event Management API

A comprehensive REST API for managing events, built with NestJS, MongoDB, and Clean Architecture principles. This system allows users to create and manage events, venues, lectures, and user roles for academic or corporate event management.

## 🚀 Features

- **Event Management**: Create and list events with registration periods
- **User Management**: User registration, authentication, and role-based access control
- **Venue Management**: Create venues and assign staff leaders
- **Lecture Management**: Schedule lectures within venues
- **Authentication**: JWT-based authentication and authorization
- **Role-based Access**: Support for multiple user roles (admin, organizer, staff_leader, staff, speaker, participant)
- **Data Validation**: Robust input validation using Zod schemas
- **Testing**: Comprehensive unit and e2e testing setup

## 🏗️ Architecture

This project follows **Clean Architecture** principles with the following structure:

```
src/
├── core/                    # Core utilities and base classes
├── domain/                  # Business logic and use cases
│   └── event/
│       └── application/
│           ├── use-cases/   # Business use cases
│           ├── repositories/ # Repository interfaces
│           └── cryptography/ # Cryptography interfaces
└── infra/                   # Infrastructure layer
    ├── auth/                # Authentication guards and strategies
    ├── cryptography/        # Cryptography implementations
    ├── database/            # Database configurations and repositories
    ├── env/                 # Environment configuration
    └── http/                # HTTP controllers and modules
```

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport
- **Validation**: Zod
- **Testing**: Jest + Vitest + Supertest
- **Environment**: Docker & Docker Compose
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- MongoDB (via Docker or local installation)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mongodb://admin:password123@localhost:27017/inatel_api?authSource=admin
DATABASE_URL_TEST=mongodb://admin:password123@localhost:27018/inatel_api_test?authSource=admin

# Server
PORT=3333
CORS_ORIGIN=http://localhost:3000

# JWT Keys (generate using the provided script)
JWT_PUBLIC_KEY=your_public_key_here
JWT_PRIVATE_KEY=your_private_key_here
```

### 4. Generate JWT Keys

```bash
node generate-jwt-keys.js
```

### 5. Start MongoDB with Docker

```bash
# Start only MongoDB
npm run docker:up

# Start MongoDB + Test DB
npm run docker:up:test

# Start MongoDB + Mongo Express (Admin UI)
npm run docker:up:admin

# Start all services
npm run docker:up:all
```

### 6. Run the application

```bash
# Development mode
npm run start:dev

# Development with Docker
npm run dev:with-docker

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3333`

## 📚 API Endpoints

### Events
- `POST /event` - Create a new event (public)
- `GET /events` - List all events

### Users
- `POST /register` - Register a new user (public)
- `POST /sessions` - Authenticate user (public)
- `GET /users/:role?` - List users by role (optional)
- `PUT /users` - Update user information
- `PUT /users/role` - Change user role

### Venues
- `POST /venue` - Create a new venue
- `GET /venues` - List all venues
- `PUT /venue/leader` - Change venue staff leader

### Lectures
- `POST /lecture` - Create a new lecture
- `GET /lectures` - List all lectures

## 🎭 User Roles

The system supports the following user roles:

- **admin**: Full system access
- **organizer**: Event organization capabilities
- **staff_leader**: Venue management and staff coordination
- **staff**: Basic staff operations
- **speaker**: Can create and manage lectures
- **participant**: Basic user with event participation rights

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage
npm run test:unit:ui
```

### E2E Tests
```bash
npm run test:e2e

# Run E2E tests with Docker
npm run test:with-docker
```

### All Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

## 🐳 Docker Commands

```bash
# Start services
npm run docker:up              # MongoDB only
npm run docker:up:test         # MongoDB + Test DB
npm run docker:up:admin        # MongoDB + Mongo Express
npm run docker:up:all          # All services

# Stop services
npm run docker:down            # Stop containers
npm run docker:down:volumes    # Stop and remove volumes

# Logs
npm run docker:logs            # MongoDB logs
npm run docker:logs:test       # Test DB logs

# Restart
npm run docker:restart         # Restart MongoDB
npm run docker:restart:test    # Restart Test DB
```

## 🗄️ Database Schema

### Main Entities

- **Event**: Core event information with registration and event periods
- **User**: User accounts with role-based permissions
- **Venue**: Physical locations for lectures with staff assignments
- **Lecture**: Scheduled presentations within venues
- **Check-in**: Attendance tracking
- **Participation**: Event participation records
- **Speaker**: Speaker information and assignments
- **Staff**: Staff assignments and responsibilities

## 🔒 Authentication

The API uses JWT tokens for authentication. Protected endpoints require a valid token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Some endpoints are public (marked with `@Public()` decorator):
- `POST /event` - Event creation
- `POST /register` - User registration  
- `POST /sessions` - User authentication

## 🛠️ Development

### Code Style
```bash
npm run format    # Format code with Prettier
npm run lint      # Lint code with ESLint
```

### Project Structure
- Follow Clean Architecture principles
- Use dependency injection
- Implement repository pattern
- Apply SOLID principles
- Use Either monad for error handling

### Adding New Features
1. Create domain entities in `mongo/schema/`
2. Define repository interfaces in `domain/event/application/repositories/`
3. Implement use cases in `domain/event/application/use-cases/`
4. Create repository implementations in `infra/database/mongo/repositories/`
5. Add HTTP controllers in `infra/http/controllers/`
6. Write tests for all layers

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | - |
| `DATABASE_URL_TEST` | Test database connection string | - |
| `PORT` | Server port | 3333 |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |
| `JWT_PUBLIC_KEY` | JWT public key for verification | - |
| `JWT_PRIVATE_KEY` | JWT private key for signing | - |

# 🧪 Integração com Jenkins (CI/CD)

Este projeto pode ser facilmente integrado ao Jenkins para automação dos testes unitários e validação contínua do código.

## 🐳 Jenkins com Suporte a Node.js e Vitest

O projeto já conta com um `Dockerfile` que prepara um ambiente Jenkins com suporte a:

- Node.js 20.x
- npm
- Execução de testes com Vitest
- Pipeline declarativa pronta para rodar testes unitários

### 📦 Dockerfile para Jenkins

```Dockerfile
# Usa a imagem oficial do Jenkins com suporte a JDK 17
FROM jenkins/jenkins:lts-jdk17

USER root

# Instalações básicas: curl, sudo, nodejs e npm
RUN apt-get update && apt-get install -y \
  curl \
  sudo \
  gnupg \
  ca-certificates \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean

# Cria um usuário jenkins com permissão sudo
RUN echo "jenkins ALL=NOPASSWD: ALL" >> /etc/sudoers

# Volta para o usuário padrão do Jenkins
USER jenkins

## 🚀 Rodando Jenkins com Docker

## 1. Construa a imagem personalizada do Jenkins:

```bash
docker build -t jenkins-vitest -f Dockerfile.jenkins .
```

## 2. Inicie o container Jenkins:
```bash
docker run -p 8080:8080 -p 50000:50000 --name jenkins-vitest -v jenkins_home:/var/jenkins_home jenkins-vitest
```

## 3. Acesse o Jenkins via: 
```bash
http://localhost:8080 
```
e configure seu projeto pipeline.