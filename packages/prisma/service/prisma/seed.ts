import 'dotenv/config';
import { prisma } from '../src/_lib/prisma.js';
import {
  type MembershipRole,
  type MovieStatus,
  type PlanType,
  type UserStatus,
} from './prisma/enums.js';

const SEED_CLEAR = process.env.SEED_CLEAR !== 'false';

const config = {
  organizations: Number(process.env.SEED_ORGS) || 50,
  users: Number(process.env.SEED_USERS) || 2000,
  genres: Number(process.env.SEED_GENRES) || 15,
  membershipsPerUserMin: 1,
  membershipsPerUserMax: 3,
  moviesPerOrg: Number(process.env.SEED_MOVIES_PER_ORG) || 500,
  genresPerMovieMin: 2,
  genresPerMovieMax: 4,
  viewEvents: Number(process.env.SEED_VIEW_EVENTS) || 20000,
  ratings: Number(process.env.SEED_RATINGS) || 10000,
  auditLogs: Number(process.env.SEED_AUDIT_LOGS) || 5000,
  batchSize: 500,
};

const PLAN_TYPES: PlanType[] = ['FREE', 'PRO', 'ENTERPRISE'];
const USER_STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE', 'PENDING'];
const MEMBERSHIP_ROLES: MembershipRole[] = ['ADMIN', 'MEMBER', 'VIEWER'];
const MOVIE_STATUSES: MovieStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

function formatCount(n: number): string {
  return n.toLocaleString().padStart(12);
}

function logStep(icon: string, label: string, count: number) {
  console.log(`  ${icon}  ${label.padEnd(16)}  ${cyan(formatCount(count))}  records`);
}

async function clear() {
  console.log(dim('\n  🧹  Clearing existing data...'));
  await prisma.auditLog.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.viewEvent.deleteMany({});
  await prisma.movieGenre.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
  console.log(green('  ✓  Cleared.\n'));
}

async function main() {
  try {
    const titleMsg = '  🌱  Prisma seed';
    console.log(bold('\n┌─────────────────────────────────────────────────────────┐'));
    console.log(bold('│ ') + green(titleMsg.padEnd(56)) + bold('│'));
    console.log(bold('└─────────────────────────────────────────────────────────┘\n'));

    if (SEED_CLEAR) {
      await clear();
    }

    const batchSize = config.batchSize;

    // 1. Organizations
    const orgPlans = Array.from(
      { length: config.organizations },
      (_, i) => (i % 3 === 0 ? 'ENTERPRISE' : i % 3 === 1 ? 'PRO' : 'FREE') as PlanType,
    );
    const orgData = Array.from({ length: config.organizations }, (_, i) => ({
      name: `Organization ${i + 1}`,
      plan: orgPlans[i]!,
    }));
    const createdOrgs: { id: string }[] = [];
    for (let i = 0; i < orgData.length; i += batchSize) {
      const chunk = orgData.slice(i, i + batchSize);
      const result = await prisma.organization.createManyAndReturn({
        data: chunk,
      });
      createdOrgs.push(...result);
    }
    const orgIds = createdOrgs.map((o) => o.id);
    logStep('🏢', 'Organizations', createdOrgs.length);

    // 2. Users
    const userStatuses = Array.from(
      { length: config.users },
      (_, i) => (i % 3 === 0 ? 'ACTIVE' : i % 3 === 1 ? 'INACTIVE' : 'PENDING') as UserStatus,
    );
    const userData = Array.from({ length: config.users }, (_, i) => ({
      email: `user-${i + 1}@seed.example.com`,
      status: userStatuses[i]!,
    }));
    const createdUsers: { id: string }[] = [];
    for (let i = 0; i < userData.length; i += batchSize) {
      const chunk = userData.slice(i, i + batchSize);
      const result = await prisma.user.createManyAndReturn({ data: chunk });
      createdUsers.push(...result);
    }
    const userIds = createdUsers.map((u) => u.id);
    logStep('👤', 'Users', createdUsers.length);

    // 3. Genres (roots first, then children)
    const rootGenreNames = [
      'Action',
      'Comedy',
      'Drama',
      'Horror',
      'Sci-Fi',
      'Thriller',
      'Romance',
      'Documentary',
      'Animation',
      'Fantasy',
    ];
    const numRoot = Math.min(10, Math.floor(config.genres / 2));
    const genreData: { name: string; parentId?: string }[] = rootGenreNames
      .slice(0, numRoot)
      .map((name) => ({ name }));
    const createdGenres: { id: string; name: string }[] = [];
    const genreResult = await prisma.genre.createManyAndReturn({
      data: genreData,
    });
    createdGenres.push(...genreResult);
    const rootGenreIds = genreResult.map((g) => g.id);
    const numChildren = config.genres - numRoot;
    for (let i = 0; i < numChildren; i++) {
      const parent = pick(rootGenreIds);
      const result = await prisma.genre.createManyAndReturn({
        data: [{ name: `Sub-Genre-${numRoot + i}`, parentId: parent }],
      });
      createdGenres.push(...result);
    }
    const genreIds = createdGenres.map((g) => g.id);
    logStep('🎭', 'Genres', createdGenres.length);

    // 4. Memberships (each user in 1–3 orgs)
    const membershipData: {
      userId: string;
      organizationId: string;
      role: MembershipRole;
    }[] = [];
    const membershipKeys = new Set<string>();
    for (const userId of userIds) {
      const n = randomInt(config.membershipsPerUserMin, config.membershipsPerUserMax);
      const shuffled = [...orgIds].sort(() => Math.random() - 0.5);
      for (let j = 0; j < n && j < shuffled.length; j++) {
        const orgId = shuffled[j]!;
        const key = `${userId}:${orgId}`;
        if (membershipKeys.has(key)) continue;
        membershipKeys.add(key);
        membershipData.push({
          userId,
          organizationId: orgId,
          role: pick(MEMBERSHIP_ROLES),
        });
      }
    }
    for (let i = 0; i < membershipData.length; i += batchSize) {
      await prisma.membership.createMany({
        data: membershipData.slice(i, i + batchSize),
      });
    }
    logStep('🔗', 'Memberships', membershipData.length);

    // 5. Movies (per org, unique title per org)
    const allMovieIds: string[] = [];
    for (let o = 0; o < orgIds.length; o++) {
      const orgId = orgIds[o]!;
      const statuses: MovieStatus[] = Array.from({ length: config.moviesPerOrg }, (_, i) =>
        pick(MOVIE_STATUSES),
      );
      for (let i = 0; i < config.moviesPerOrg; i += batchSize) {
        const chunkSize = Math.min(batchSize, config.moviesPerOrg - i);
        const data = Array.from({ length: chunkSize }, (_, j) => ({
          organizationId: orgId,
          title: `Movie ${o}-${i + j}`,
          synopsis: `Synopsis for movie ${o}-${i + j}.`,
          releaseYear: 1990 + ((i + j) % 35),
          durationMinutes: 80 + ((i + j) % 120),
          rating: (i + j) % 3 === 0 ? 7.5 : null,
          status: statuses[i + j]!,
        }));
        const result = await prisma.movie.createManyAndReturn({ data });
        allMovieIds.push(...result.map((m) => m.id));
      }
    }
    logStep('🎬', 'Movies', allMovieIds.length);

    // 6. MovieGenres (each movie 2–4 genres)
    const movieGenreKeys = new Set<string>();
    const movieGenreData: { movieId: string; genreId: string }[] = [];
    for (const movieId of allMovieIds) {
      const n = randomInt(config.genresPerMovieMin, config.genresPerMovieMax);
      const shuffled = [...genreIds].sort(() => Math.random() - 0.5);
      for (let j = 0; j < n && j < shuffled.length; j++) {
        const genreId = shuffled[j]!;
        const key = `${movieId}:${genreId}`;
        if (movieGenreKeys.has(key)) continue;
        movieGenreKeys.add(key);
        movieGenreData.push({ movieId, genreId });
      }
    }
    for (let i = 0; i < movieGenreData.length; i += batchSize) {
      await prisma.movieGenre.createMany({
        data: movieGenreData.slice(i, i + batchSize),
      });
    }
    logStep('🏷️', 'Movie genres', movieGenreData.length);

    // 7. ViewEvents
    const viewEventData: {
      movieId: string;
      userId: string;
      viewedAt: Date;
      durationSeconds: number;
    }[] = [];
    const now = Date.now();
    for (let i = 0; i < config.viewEvents; i++) {
      viewEventData.push({
        movieId: pick(allMovieIds),
        userId: pick(userIds),
        viewedAt: new Date(now - Math.random() * 365 * 24 * 60 * 60 * 1000),
        durationSeconds: randomInt(60, 7200),
      });
    }
    for (let i = 0; i < viewEventData.length; i += batchSize) {
      await prisma.viewEvent.createMany({
        data: viewEventData.slice(i, i + batchSize),
      });
    }
    logStep('👁️', 'View events', viewEventData.length);

    // 8. Ratings (unique (userId, movieId))
    const ratingKeys = new Set<string>();
    const ratingData: { userId: string; movieId: string; score: number }[] = [];
    while (ratingData.length < config.ratings) {
      const userId = pick(userIds);
      const movieId = pick(allMovieIds);
      const key = `${userId}:${movieId}`;
      if (ratingKeys.has(key)) continue;
      ratingKeys.add(key);
      ratingData.push({
        userId,
        movieId,
        score: randomInt(1, 10),
      });
    }
    for (let i = 0; i < ratingData.length; i += batchSize) {
      await prisma.rating.createMany({
        data: ratingData.slice(i, i + batchSize),
      });
    }
    logStep('⭐', 'Ratings', ratingData.length);

    // 9. AuditLogs
    const auditLogData = Array.from({ length: config.auditLogs }, () => ({
      organizationId: pick(orgIds),
      actorUserId: pick(userIds),
      action: pick(['create', 'update', 'delete', 'view']),
      entityType: pick(['movie', 'user', 'organization']),
      entityId: crypto.randomUUID(),
      payload: {} as object,
    }));
    for (let i = 0; i < auditLogData.length; i += batchSize) {
      await prisma.auditLog.createMany({
        data: auditLogData.slice(i, i + batchSize),
      });
    }
    logStep('📋', 'Audit logs', auditLogData.length);

    const successMsg = '  ✅  Seed completed successfully';
    console.log(bold('\n┌─────────────────────────────────────────────────────────┐'));
    console.log(bold('│ ') + green(successMsg.padEnd(56)) + bold('│'));
    console.log(bold('└─────────────────────────────────────────────────────────┘\n'));
  } catch (err) {
    console.error(red('\n  ❌  Seed failed:'), err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
