# NineHertz NestJS Server with TypeORM & Docker

![NestJS Version](https://img.shields.io/github/package-json/dependency-version/devalentineomonya/NineHertz-NestJs-Tanstack-Start/server/@nestjs/core?color=red&logo=nestjs)
![Node.js Version](https://img.shields.io/github/package-json/dependency-version/devalentineomonya/NineHertz-NestJs-Tanstack-Start/server/engines/node?color=green&logo=node.js)
![TypeScript Version](https://img.shields.io/github/package-json/dependency-version/devalentineomonya/NineHertz-NestJs-Tanstack-Start/server/dev/typescript?color=blue&logo=typescript)
![TypeORM Version](https://img.shields.io/github/package-json/dependency-version/devalentineomonya/NineHertz-NestJs-Tanstack-Start/server/typeorm?color=informational)
![Docker](https://img.shields.io/badge/Docker-✓-blue?logo=docker)
![PNPM](https://img.shields.io/badge/pnpm-✓-orange?logo=pnpm)
![License](https://img.shields.io/github/license/devalentineomonya/NineHertz-NestJs-Tanstack-Start?color=blue)

## Overview

This NestJS server provides a robust backend API for the NineHertz full-stack application. It features a modern architecture with TypeORM for database operations, Docker for containerization, and JWT authentication. Designed for rapid development and easy deployment.

## Project Structure

```bash
server/
├── src/
│   ├── auth/             # Authentication module
│   ├── common/           # Shared utilities and decorators
│   ├── config/           # Configuration setup
│   ├── entities/         # TypeORM entity definitions
│   ├── modules/          # Feature modules
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── docker/               # Docker configuration files
├── .env.example          # Environment variables template
├── docker-compose.yml    # Docker compose configuration
├── nest-cli.json         # NestJS configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Key Features

- 🐳 **Docker Integration** - Containerized development and deployment
- 🛡️ **JWT Authentication** - Secure token-based authentication
- 🗄️ **TypeORM** - Powerful ORM with PostgreSQL support
- 📝 **DTO Validation** - Robust input validation using class-validator
- 🧩 **Modular Architecture** - Clean separation of concerns
- 🔌 **Environment Configuration** - Easy management of environment variables
- 📊 **Swagger Documentation** - Auto-generated API documentation
- 🚦 **Error Handling** - Custom exception filters and interceptors

## Prerequisites

- Node.js v18+
- Docker & Docker Compose
- PNPM (recommended)

## Getting Started

### 1. Clone the repository:
```bash
git clone https://github.com/devalentineomonya/NineHertz-NestJs-Tanstack-Start.git
cd NineHertz-NestJs-Tanstack-Start/server
```

### 2. Install dependencies:
```bash
pnpm install
```

### 3. Configure environment:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

### 4. Start Docker containers:
```bash
docker-compose up -d
```

### 5. Run database migrations:
```bash
pnpm typeorm migration:run
```

### 6. Start the server:
```bash
pnpm start:dev
```

## Development Workflow

**Start all services:**
```bash
docker-compose up -d
pnpm start:dev
```

**Run database migrations:**
```bash
pnpm typeorm migration:run
```

**Generate new migration:**
```bash
pnpm typeorm migration:generate src/migrations/<MigrationName>
```

**Access database container:**
```bash
docker exec -it ninehertz-db psql -U postgres
```

## API Documentation

After starting the server, access the Swagger UI at:
```
http://localhost:3000/api
```

## Docker Management

**Start containers:**
```bash
docker-compose up -d
```

**Stop containers:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

**Rebuild containers:**
```bash
docker-compose up -d --build
```

## Environment Variables

| Variable         | Description                | Default Value     |
|------------------|----------------------------|------------------|
| PORT            | Server port               | 3000            |
| DB_HOST         | Database host             | localhost       |
| DB_PORT         | Database port             | 5432            |
| DB_USERNAME     | Database user             | postgres        |
| DB_PASSWORD     | Database password         | postgres        |
| DB_NAME         | Database name             | ninehertz       |
| JWT_SECRET      | JWT signing secret        | -               |
| JWT_EXPIRES_IN  | Token expiration time     | 1h              |

## Production Deployment

### Build Docker image:
```bash
docker build -t ninehertz-server .
```

### Run container:
```bash
docker run -d --name ninehertz-app \
  -p 3000:3000 \
  --env-file .env \
  ninehertz-server
```

### Docker Compose (production):
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## TypeORM Configuration

TypeORM is configured in `src/config/typeorm.config.ts`. Key settings:

```typescript
export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // Always false in production!
  logging: process.env.NODE_ENV === 'development',
}));
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am 'Add some feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/devalentineomonya/NineHertz-NestJs-Tanstack-Start/blob/main/LICENSE) file for details.

## Support

For issues or questions, please [open an issue](https://github.com/devalentineomonya/NineHertz-NestJs-Tanstack-Start/issues) on GitHub.
