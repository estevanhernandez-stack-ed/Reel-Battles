# CineGame Runbook

Operational procedures for running, deploying, monitoring, and maintaining the CineGame application.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Environment Setup](#environment-setup)
3. [Deployment](#deployment)
4. [Startup Procedures](#startup-procedures)
5. [Health Checks](#health-checks)
6. [Monitoring](#monitoring)
7. [Database Operations](#database-operations)
8. [Incident Response](#incident-response)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Scaling Considerations](#scaling-considerations)
11. [Backup and Recovery](#backup-and-recovery)
12. [Routine Maintenance](#routine-maintenance)
13. [Rollback Procedures](#rollback-procedures)
14. [Security Checklist](#security-checklist)
15. [Contact and Escalation](#contact-and-escalation)

---

## System Overview

CineGame has two frontends and one backend:

| Component | Technology | Port | Description |
|-----------|-----------|------|-------------|
| Backend API + Web | Express 5 / TypeScript + Vite | 5000 | RESTful JSON API and serves the React web frontend |
| Database | PostgreSQL (Neon) | 5432 | 10 tables, 38K+ trivia questions, game sessions, profiles |
| Mobile App | React Native / Expo | N/A | Connects to backend API via HTTP |

The backend is a single Node.js process serving both the API and the Vite-built web frontend. The mobile app runs on device via Expo Go and connects to the same API. There is no background job queue or message broker.

### Critical Dependencies

| Dependency | Impact if Down | Recovery |
|------------|---------------|----------|
| PostgreSQL | All API endpoints fail | Check DATABASE_URL, restart database |
| Node.js server | No API responses, mobile app shows errors | Restart workflow |
| Expo Go | Mobile app cannot load | Use standalone build or restart Expo |

---

## Environment Setup

### Required Environment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `DATABASE_URL` | Secret | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Secret | Express session signing key | Random string, 32+ characters |
| `NODE_ENV` | Env Var | Runtime environment | `development` or `production` |

### Verifying Environment

```bash
# Check database connectivity
curl http://localhost:5000/api/trivia/stats

# Expected response:
# {"totalQuestions": 38505, "source": "postgresql"}
```

---

## Deployment

### Replit Deployment

1. Ensure the `Start application` workflow is running (`npm run dev`)
2. Verify all API endpoints respond (see Health Checks)
3. Use the Replit "Publish" button to deploy
4. The published URL will be `https://<app-name>.replit.app`

### Production Build

```bash
# Build the production server bundle
npm run build

# Start in production mode
npm start
```

### Mobile App (Optional)

The mobile app is developed separately using Expo and requires Expo CLI:

```bash
# Start the Expo dev server (requires Expo CLI)
npx expo start
```

---

## Startup Procedures

### Cold Start (Fresh Environment)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Push database schema:
   ```bash
   npm run db:push
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Verify seeding completed (check server logs for "Seeded X questions"):
   ```bash
   curl http://localhost:5000/api/trivia/stats
   ```
5. Verify achievement definitions are loaded:
   ```bash
   curl http://localhost:5000/api/achievements
   # Should return 11 achievements
   ```

### Warm Start (Existing Environment)

1. Start the server:
   ```bash
   npm run dev
   ```
2. Server auto-detects existing data and skips seeding
3. Achievements are verified/seeded on every startup

### Startup Sequence

The server performs these steps on boot (see `server/index.ts`):

1. Connect to PostgreSQL via `DATABASE_URL`
2. Register all API routes
3. Seed achievement definitions (inserts any missing achievements)
4. Seed sample data if tables are empty (trivia, movies, athletes)
5. Start listening on port 5000

---

## Health Checks

### Endpoint Health Matrix

| Check | Endpoint | Expected Status | Expected Response |
|-------|----------|----------------|-------------------|
| Server alive | `GET /api/trivia/stats` | 200 | `{"totalQuestions": N, "source": "postgresql"}` |
| Database read | `GET /api/movies` | 200 | Array of movie objects |
| Database write | `POST /api/profiles` | 200 | Profile object |
| Daily challenge | `GET /api/daily-challenge` | 200 | Challenge with today's date |
| Achievements | `GET /api/achievements` | 200 | Array of 11 achievements |

### Quick Health Check Script

```bash
echo "=== Server Health ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/trivia/stats
echo ""

echo "=== Database Read ==="
curl -s http://localhost:5000/api/trivia/stats | head -50

echo "=== Daily Challenge ==="
curl -s http://localhost:5000/api/daily-challenge | head -50

echo "=== Achievements Count ==="
curl -s http://localhost:5000/api/achievements | node -e "
  const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
  console.log(d.length + ' achievements loaded');
"
```

---

## Monitoring

### What to Monitor

| Metric | How to Check | Threshold |
|--------|-------------|-----------|
| Server responsiveness | HTTP 200 from `/api/trivia/stats` | Response within 2 seconds |
| Database connectivity | Any API call returning data | Should not return 500 |
| Daily challenge availability | `GET /api/daily-challenge` | Should return today's date |
| Error rate | Server console logs | Any `Error` or `Failed to` messages |
| Database table sizes | SQL query (see below) | Trivia > 0, Achievements = 11 |

### Database Table Size Check

```sql
SELECT
  'trivia_questions' AS table_name, COUNT(*) AS row_count FROM trivia_questions
UNION ALL SELECT
  'movies', COUNT(*) FROM movies
UNION ALL SELECT
  'movie_athletes', COUNT(*) FROM movie_athletes
UNION ALL SELECT
  'profiles', COUNT(*) FROM profiles
UNION ALL SELECT
  'game_sessions', COUNT(*) FROM game_sessions
UNION ALL SELECT
  'achievements', COUNT(*) FROM achievements
UNION ALL SELECT
  'user_achievements', COUNT(*) FROM user_achievements
UNION ALL SELECT
  'daily_challenges', COUNT(*) FROM daily_challenges
UNION ALL SELECT
  'user_daily_progress', COUNT(*) FROM user_daily_progress;
```

### Log Patterns to Watch

| Pattern | Severity | Meaning |
|---------|----------|---------|
| `Error fetching trivia questions` | High | Database read failure |
| `Achievement check error` | Medium | Achievement granting failed (non-blocking) |
| `Failed to seed database` | High | Initial data load failed |
| `Trivia questions already exist, skipping seed` | Info | Normal warm start |
| `Achievements seeded` | Info | Achievement definitions loaded |

---

## Database Operations

### Schema Changes

```bash
# After modifying shared/schema.ts:
npm run db:push

# If push fails due to conflicts:
npm run db:push --force
```

**WARNING**: Never manually change primary key column types. This causes destructive migrations.

### Adding Trivia Questions

```sql
INSERT INTO trivia_questions (question, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, category, difficulty)
VALUES (
  'Your question here?',
  'Correct answer',
  'Wrong option 1',
  'Wrong option 2',
  'Wrong option 3',
  'Category',
  'easy'  -- easy, medium, or hard
);
```

### Adding Movies

```sql
INSERT INTO movies (title, year, opening_weekend, genre, director, rating, synopsis)
VALUES (
  'Movie Title',
  2024,
  50000000,
  'Action',
  'Director Name',
  'PG-13',
  'Synopsis text'
);
```

Or via the Admin API:

```bash
curl -X POST http://localhost:5000/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Movie Title","year":2024,"genre":"Action","openingWeekend":50000000}'
```

### Resetting a Player's Profile

```sql
-- Reset streak data
UPDATE profiles
SET current_streak = 0, longest_streak = 0, last_challenge_date = NULL
WHERE username = 'player_username';

-- Remove all achievements for a profile
DELETE FROM user_achievements WHERE profile_id = 'profile-uuid-here';

-- Remove daily progress
DELETE FROM user_daily_progress WHERE profile_id = 'profile-uuid-here';
```

### Viewing Leaderboard Data

```sql
SELECT
  p.username,
  g.game_type,
  SUM(g.score) AS total_score,
  COUNT(*) AS games_played
FROM game_sessions g
JOIN profiles p ON g.profile_id = p.id
GROUP BY p.username, g.game_type
ORDER BY total_score DESC
LIMIT 20;
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|--------------|---------|
| P1 - Critical | App completely down | Immediate | Database unreachable, server crash |
| P2 - Major | Core feature broken | Within 1 hour | Game mode not loading, scores not saving |
| P3 - Minor | Non-critical issue | Within 24 hours | Achievement not granting, leaderboard stale |
| P4 - Low | Cosmetic / enhancement | Next sprint | UI alignment, typo in achievement text |

### P1 Response Steps

1. **Identify**: Check server logs for errors
2. **Verify database**: Run `curl http://localhost:5000/api/trivia/stats`
3. **Restart server**: Restart the `Start application` workflow
4. **If database down**: Check `DATABASE_URL` environment variable, verify Replit database status
5. **If data corrupted**: Use Replit checkpoint rollback
6. **Communicate**: Note the issue and resolution

### P2 Response Steps

1. **Reproduce**: Identify the failing endpoint via logs
2. **Check recent changes**: Review recent git commits
3. **Fix or rollback**: Either patch the code or use Replit checkpoint rollback
4. **Verify**: Run health checks after fix

---

## Troubleshooting Guide

### Server Won't Start

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Error: connect ECONNREFUSED` | Database not running | Check DATABASE_URL, restart database |
| `relation "X" does not exist` | Schema not pushed | Run `npm run db:push` |
| `Module not found` | Missing dependencies | Run `npm install` |
| Port 5000 already in use | Previous process still running | Kill the process, restart workflow |

### Mobile App Can't Connect

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Network request failed | Wrong API URL | Check `mobile/constants/api.ts` BASE_URL |
| Connection refused | Server not running | Start the backend first |
| CORS errors | Cross-origin blocked | Verify Express CORS middleware |

### Games Not Saving Scores

1. Check that the profile was created: `curl http://localhost:5000/api/profiles/<id>`
2. Verify the POST body matches the schema: `gameType`, `score`, `totalQuestions` are required
3. Check server logs for `Error creating game session`

### Daily Challenge Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Same challenge as yesterday | Date timezone mismatch | Server uses UTC; verify server timezone |
| Streak not incrementing | `lastChallengeDate` doesn't match yesterday | Check profile's `last_challenge_date` field |
| Challenge shows as completed | `user_daily_progress` already has today's entry | Clear today's progress if testing |

### Achievements Not Granting

1. Achievement checks run asynchronously after game saves
2. Verify the profile exists and has a valid `profileId`
3. Check that the game session was saved first
4. Look for `Achievement check error` in server logs
5. Verify the achievement definition exists: `curl http://localhost:5000/api/achievements`

---

## Scaling Considerations

### Current Limits

| Resource | Current Capacity | Bottleneck |
|----------|-----------------|-----------|
| Trivia questions | 38,505 | Storage only; no performance issue |
| Concurrent users | ~100-500 | Single Node.js process |
| Database connections | Pool default (10) | pg pool configuration |
| Response time | <100ms typical | Database query complexity |

### Scaling Path

1. **Database**: The PostgreSQL instance can handle thousands of concurrent reads. Leaderboard queries with JOINs and aggregations are the most expensive.
2. **Server**: For higher concurrency, run multiple Node.js instances behind a load balancer (not applicable on Replit single-instance).
3. **Caching**: Add Redis caching for leaderboard results and daily challenge data to reduce database load.
4. **CDN**: Serve static assets (movie posters) through a CDN.

---

## Backup and Recovery

### Database Backup

On Replit, the PostgreSQL database is managed by Neon and includes automatic backups. For manual exports:

```bash
# Export specific tables
pg_dump $DATABASE_URL --data-only -t trivia_questions > trivia_backup.sql
pg_dump $DATABASE_URL --data-only -t movies > movies_backup.sql
pg_dump $DATABASE_URL --data-only -t movie_athletes > athletes_backup.sql
```

### Checkpoint Recovery

Replit automatically creates checkpoints. To roll back:

1. Use Replit's "View Checkpoints" feature
2. Select the checkpoint from before the issue
3. Confirm rollback (this restores code, chat, and database)

### Data Recovery from Seed

If sample data is lost, it will be re-seeded automatically on next server restart (seed checks for empty tables).

For achievement definitions specifically, they are re-verified on every server start via `seedAchievements()`.

---

## Routine Maintenance

### Daily

- Verify daily challenge is generating (new seed each day)
- Check server logs for any error patterns

### Weekly

- Review leaderboard data for anomalies
- Check database table growth rates
- Verify achievement granting is working for active players

### Monthly

- Review and rotate `SESSION_SECRET` if needed
- Check for dependency updates: `npm outdated`
- Review database size and performance
- Archive old game sessions if storage becomes a concern

### Database Cleanup (if needed)

```sql
-- Remove game sessions older than 90 days (optional)
DELETE FROM game_sessions
WHERE created_at < NOW() - INTERVAL '90 days';

-- Remove orphaned daily progress entries
DELETE FROM user_daily_progress
WHERE profile_id NOT IN (SELECT id FROM profiles);
```

---

## Rollback Procedures

### Code Rollback

Use Replit checkpoints to restore to a known-good state. This restores code files and database together.

### Schema Rollback

If a schema push causes issues:

1. Revert the change in `shared/schema.ts`
2. Run `npm run db:push --force`
3. If data was lost, restore from backup or re-seed

### Data Rollback

For accidental data deletion:

1. Use Replit checkpoint rollback (restores database too)
2. Or re-seed by clearing the affected table and restarting the server

---

## Security Checklist

- [ ] `DATABASE_URL` is stored as a secret, never logged or exposed
- [ ] `SESSION_SECRET` is stored as a secret, never committed to code
- [ ] No API keys are hardcoded in source files
- [ ] Admin endpoints (`/api/admin/*`) are not exposed to end users in production
- [ ] Input validation via Zod schemas on all POST endpoints
- [ ] SQL injection prevented by Drizzle ORM parameterized queries
- [ ] No user passwords are stored in plaintext (profiles use username only, no password)
- [ ] Error responses do not leak internal details (generic error messages returned)

---

## Contact and Escalation

| Role | Responsibility |
|------|---------------|
| Developer | Code changes, bug fixes, feature development |
| Database Admin | Schema changes, data recovery, performance tuning |
| Infrastructure | Server uptime, deployment, environment configuration |

For Replit platform issues (database connectivity, deployment failures), contact Replit support.
