#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const ORMS = ['prisma', 'typeorm', 'sequelize', 'drizzle'];
const SERVICE_NAMES = {
  prisma: '@rd-node-orms/prisma-service',
  typeorm: '@rd-node-orms/typeorm-service',
  sequelize: '@rd-node-orms/sequelize-service',
  drizzle: '@rd-node-orms/drizzle-service',
};

const [command, orm] = process.argv.slice(2);

if (!command || !orm) {
  console.error('Usage: node scripts/orm-helper.js <command> <orm>');
  console.error('Commands: db:up, db:down, db:reset, service:dev, service:start');
  console.error('ORMs:', ORMS.join(', '));
  process.exit(1);
}

if (!ORMS.includes(orm)) {
  console.error(`Invalid ORM: ${orm}. Must be one of: ${ORMS.join(', ')}`);
  process.exit(1);
}

const packageDir = path.join(__dirname, '..', 'packages', orm);
const serviceName = SERVICE_NAMES[orm];

try {
  switch (command) {
    case 'db:up':
      execSync('docker compose up -d', { cwd: packageDir, stdio: 'inherit' });
      break;
    case 'db:down':
      execSync('docker compose down', { cwd: packageDir, stdio: 'inherit' });
      break;
    case 'db:reset':
      execSync('docker compose down -v && docker compose up -d', {
        cwd: packageDir,
        stdio: 'inherit',
        shell: true,
      });
      break;
    case 'service:dev':
      execSync(`dotenv -e .env -- pnpm --filter ${serviceName} dev`, {
        stdio: 'inherit',
        shell: true,
      });
      break;
    case 'service:start':
      execSync(`dotenv -e .env -- pnpm --filter ${serviceName} start`, {
        stdio: 'inherit',
        shell: true,
      });
      break;
    case 'dev':
      execSync('docker compose up -d', { cwd: packageDir, stdio: 'inherit' });
      execSync(`dotenv -e .env -- pnpm --filter ${serviceName} dev`, {
        stdio: 'inherit',
        shell: true,
      });
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
} catch (error) {
  process.exit(1);
}
