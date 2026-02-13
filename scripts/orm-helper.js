#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
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
  console.error('ORMs:', [...ORMS, 'all'].join(', '));
  process.exit(1);
}

if (!ORMS.includes(orm) && orm !== 'all') {
  console.error(`Invalid ORM: ${orm}. Must be one of: ${[...ORMS, 'all'].join(', ')}`);
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const rootEnvPath = path.join(rootDir, '.env');
const packageDir = path.join(rootDir, 'packages', orm);
const serviceName = SERVICE_NAMES[orm];

// Handle "all" ORM option
if (orm === 'all') {
  try {
    switch (command) {
      case 'db:up':
        ORMS.forEach((ormName) => {
          const dir = path.join(rootDir, 'packages', ormName);
          execSync(`dotenv -e "${rootEnvPath}" -- docker compose up -d`, {
            cwd: dir,
            stdio: 'inherit',
            shell: true,
          });
        });
        break;
      case 'db:down':
        ORMS.forEach((ormName) => {
          const dir = path.join(rootDir, 'packages', ormName);
          execSync(`dotenv -e "${rootEnvPath}" -- docker compose down`, {
            cwd: dir,
            stdio: 'inherit',
            shell: true,
          });
        });
        break;
      case 'db:reset':
        ORMS.forEach((ormName) => {
          const dir = path.join(rootDir, 'packages', ormName);
          execSync(
            `dotenv -e "${rootEnvPath}" -- docker compose down -v && dotenv -e "${rootEnvPath}" -- docker compose up -d`,
            {
              cwd: dir,
              stdio: 'inherit',
              shell: true,
            },
          );
        });
        break;
      case 'dev':
        // Start all databases first
        ORMS.forEach((ormName) => {
          const dir = path.join(rootDir, 'packages', ormName);
          execSync(`dotenv -e "${rootEnvPath}" -- docker compose up -d`, {
            cwd: dir,
            stdio: 'inherit',
            shell: true,
          });
        });
        // Then start all services in parallel
        const processes = ORMS.map((ormName) => {
          const serviceName = SERVICE_NAMES[ormName];
          const proc = spawn(
            'dotenv',
            ['-e', rootEnvPath, '--', 'pnpm', '--filter', serviceName, 'dev'],
            {
              stdio: 'inherit',
              shell: true,
              cwd: rootDir,
              env: { ...process.env },
            },
          );
          return proc;
        });
        // Handle process termination
        const cleanup = () => {
          processes.forEach((proc) => {
            proc.kill();
          });
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        // Wait for all processes
        Promise.all(
          processes.map(
            (proc) =>
              new Promise((resolve) => {
                proc.on('exit', resolve);
              }),
          ),
        ).then(() => {
          process.exit(0);
        });
        break;
      default:
        console.error(`Command "${command}" does not support "all" ORM option`);
        process.exit(1);
    }
    if (command !== 'dev') {
      process.exit(0);
    }
  } catch (error) {
    process.exit(1);
  }
}

try {
  switch (command) {
    case 'db:up':
      execSync(`dotenv -e "${rootEnvPath}" -- docker compose up -d`, {
        cwd: packageDir,
        stdio: 'inherit',
        shell: true,
      });
      break;
    case 'db:down':
      execSync(`dotenv -e "${rootEnvPath}" -- docker compose down`, {
        cwd: packageDir,
        stdio: 'inherit',
        shell: true,
      });
      break;
    case 'db:reset':
      execSync(
        `dotenv -e "${rootEnvPath}" -- docker compose down -v && dotenv -e "${rootEnvPath}" -- docker compose up -d`,
        {
          cwd: packageDir,
          stdio: 'inherit',
          shell: true,
        },
      );
      break;
    case 'service:dev':
      execSync(`dotenv -e "${rootEnvPath}" -- pnpm --filter ${serviceName} dev`, {
        stdio: 'inherit',
        shell: true,
        cwd: rootDir,
      });
      break;
    case 'service:start':
      execSync(`dotenv -e "${rootEnvPath}" -- pnpm --filter ${serviceName} start`, {
        stdio: 'inherit',
        shell: true,
        cwd: rootDir,
      });
      break;
    case 'dev':
      execSync(`dotenv -e "${rootEnvPath}" -- docker compose up -d`, {
        cwd: packageDir,
        stdio: 'inherit',
        shell: true,
      });
      execSync(`dotenv -e "${rootEnvPath}" -- pnpm --filter ${serviceName} dev`, {
        stdio: 'inherit',
        shell: true,
        cwd: rootDir,
      });
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
} catch (error) {
  process.exit(1);
}
