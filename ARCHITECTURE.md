# CineGame Architecture

Detailed system architecture, data flow, and design decisions.

---

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Model](#data-model)
- [Data Flow](#data-flow)
- [Game Mode Design](#game-mode-design)
- [Engagement System Design](#engagement-system-design)
- [Security Model](#security-model)
- [Design Decisions](#design-decisions)
- [Technology Rationale](#technology-rationale)

---

## System Overview

CineGame has two frontends (mobile and web) sharing one backend:

```
+---------------------+          HTTP/JSON           +-------------------+
|                     |  --------------------------> |                   |
|   React Native /    |                              |   Express 5       |
|   Expo Mobile App   |  <-------------------------- |   API Server      |
|                     |                              |   (Port 5000)     |
+---------------------+                              |                   |
                                                     |   + Vite serves   |
+---------------------+          HTTP/JSON           |   React web       |
|                     |  --------------------------> |   client           |
|   React / Vite      |                              |                   |
|   Web Frontend      |  <-------------------------- |                   |
|                     |                              +-------------------+
+---------------------+                                    |
                                                            | Drizzle ORM
                                                            v
                                                     +-------------------+
                                                     |                   |
                                                     |   PostgreSQL      |
                                                     |   (Neon-backed)   |
                                                     |                   |
                                                     +-------------------+
```

There is no background job queue, message broker, or caching layer. The server is a single Node.js process that serves both the API and the web frontend (via Vite middleware in development, static files in production).

---

## Component Architecture

### Mobile App (Client)

```
app/
  _layout.tsx            # Tab navigator configuration
  index.tsx              # Home screen (entry point)
  trivia.tsx             # Trivia game screen
  draft.tsx              # Draft game screen
  boxoffice.tsx          # Box office game screen
  stats.tsx              # Stats/leaderboard/achievements
  admin.tsx              # Admin data management

mobile/
  constants/
    api.ts               # HTTP client (fetch wrapper)
    theme.ts             # Design tokens (colors, spacing, fonts)
  hooks/
    useProfile.ts        # Profile state management
```

**Navigation Flow:**

```
Bottom Tab Navigator
  |
  +-- Play Tab (index.tsx)
  |     |-- Profile Modal (first launch)
  |     |-- Daily Challenge Card --> trivia.tsx?daily=true
  |     |-- Trivia Card --> trivia.tsx
  |     |-- Draft Card --> draft.tsx
  |     +-- Box Office Card --> boxoffice.tsx
  |
  +-- Stats Tab (stats.tsx)
  |     |-- My Stats subtab
  |     |-- Leaderboard subtab
  |     +-- Badges subtab
  |
  +-- Admin Tab (admin.tsx)
```

### Web Frontend (Client)

```
client/
  src/                     # React / Vite web application
    pages/                 # Page components (wouter routing)
    components/            # Shared UI components
    hooks/                 # Custom React hooks
    lib/                   # Utilities (query client, API helpers)
```

The web frontend uses wouter for client-side routing, TanStack Query for data fetching, and shadcn/ui components for the UI. It shares the same API endpoints as the mobile app.

### Backend (Server)

```
server/
  index.ts               # HTTP server setup, startup sequence, Vite middleware
  routes.ts              # Route handlers + scoring + achievements
  storage.ts             # IStorage interface + DatabaseStorage implementation
  seed.ts                # Initial data seeding
  db.ts                  # Drizzle + pg connection pool
  vite.ts                # Vite dev server middleware (serves web client)

shared/
  schema.ts              # Drizzle table definitions, Zod schemas, TypeScript types
```

**Startup Sequence:**

```
1. Create Express app
2. Configure middleware (JSON parsing, sessions)
3. Register API routes (routes.ts)
4. Seed achievement definitions (idempotent)
5. Seed sample data if tables empty (idempotent)
6. Start listening on port 5000
```

---

## Data Model

### Entity Relationship Diagram

```
profiles 1---* game_sessions
profiles 1---* user_daily_progress
profiles 1---* user_achievements

daily_challenges 1---* user_daily_progress (via challenge_date)

achievements 1---* user_achievements

trivia_questions (standalone, read-only in gameplay)
movies (standalone, read-only in gameplay)
movie_athletes (standalone, read-only in gameplay)
users (legacy, not used by mobile app)
```

### Table Descriptions

| Table | Rows (Typical) | Write Frequency | Purpose |
|-------|----------------|----------------|---------|
| trivia_questions | 38,505 | Rare (admin only) | Quiz question pool |
| movies | 20-100 | Rare (admin only) | Box office game data |
| movie_athletes | 58 | Rare (admin only) | Draft character pool |
| profiles | Growing | On first launch per user | Player identity |
| game_sessions | Growing rapidly | Every game completion | Score history |
| daily_challenges | 1 per day | Auto-created daily | Daily challenge seed |
| user_daily_progress | Growing | 1 per user per day max | Daily completion records |
| achievements | 11 (fixed) | Only on schema updates | Achievement definitions |
| user_achievements | Growing | On achievement unlock | Earned badges |
| users | 0 | Never | Legacy table from initial template, not used by the app |

### ID Strategy

All tables use UUIDs generated by PostgreSQL:

```sql
id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
```

This avoids sequential ID enumeration and works well with distributed systems.

---

## Data Flow

### Game Completion Flow

```
1. Player completes a game (trivia/draft/boxoffice)
2. Client sends POST /api/games with { profileId, gameType, score, totalQuestions }
3. Server validates via Zod schema
4. Server inserts game_session row
5. Server returns the saved session
6. Asynchronously: checkAndGrantAchievements(profileId, context)
   a. Load all achievement definitions
   b. Load player's profile and game history
   c. For each achievement not yet earned, evaluate conditions
   d. Grant any newly earned achievements
```

### Daily Challenge Flow

```
1. Home screen loads: GET /api/daily-challenge?profileId=X
2. Server checks if today's challenge exists, creates if not
3. Server checks if profileId has completed today's challenge
4. Returns challenge data with completed=true/false

5. Player taps daily challenge card
6. Trivia screen loads with ?daily=true&seed=YYYYMMDD
7. GET /api/trivia/questions?limit=10&seed=YYYYMMDD
8. Server uses seed to deterministically select questions (md5 hash ordering)
9. All players get the same 10 questions for the same day

10. Player finishes the quiz
11. POST /api/daily-challenge/complete { profileId, score, totalQuestions }
12. Server records completion in user_daily_progress
13. Server calculates streak:
    - If last challenge was yesterday: streak = currentStreak + 1
    - Otherwise: streak = 1
14. Server updates profile streak fields
15. Server creates a game_session for "daily" type
16. Async: checkAndGrantAchievements for daily achievements
```

### Profile Flow

```
1. App launches
2. useProfile hook checks AsyncStorage for saved profileId
3. If found: GET /api/profiles/:id to load profile data
4. If not found: Show profile creation modal
5. User enters username
6. POST /api/profiles { username }
7. Server creates or returns existing profile
8. Client saves profileId to AsyncStorage
9. Profile data (username, streak) available via useProfile hook
```

### Leaderboard Flow

```
1. Stats screen > Leaderboard tab
2. GET /api/leaderboard?gameType=trivia&period=alltime&limit=20
3. Server aggregates game_sessions:
   - JOIN with profiles on profile_id
   - SUM(score) as totalScore
   - COUNT(*) as gamesPlayed
   - Filter by gameType
   - Filter by period (weekly = last 7 days)
   - ORDER BY totalScore DESC
4. Returns ranked list with username, score, games played
```

---

## Game Mode Design

### Trivia Quiz

**Question Selection:** Random selection from 38,505 questions using `ORDER BY RANDOM()` in PostgreSQL, or deterministic selection using `ORDER BY md5(id || seed)` for daily challenges.

**Scoring:** 1 point per correct answer, max 10 per round.

**Hint System:** Optional hints stored per question. Using a hint does not affect scoring but is tracked in the results display.

### Movie Draft

**Draft Mechanics:**
- 7 archetype rounds (captain, natural, underdog, veteran, villain, teammate, wildcard)
- Player picks 5 characters total
- Opponent auto-drafts from remaining pool
- Round progresses through archetypes cyclically

**Battle Scoring:**

Each athlete's score = weighted sum of 8 stats:

```
Score = athleticism * 1.0
      + clutch * 1.2
      + leadership * 1.1
      + heart * 1.3
      + skill * 1.0
      + intimidation * 0.8
      + teamwork * 1.2
      + charisma * 0.7
```

Synergy bonuses (applied to team total):
- Captain archetype present: +50 points
- Veteran + Underdog combination: +30 points
- Natural + Teammate combination: +25 points
- 4 or more unique archetypes: +40 points

**Win/Loss:** Team with higher total score wins. Score = 1 for win, 0 for loss (stored in game_sessions).

### Box Office Heads Up

**Mechanics:** Two random movies shown; player guesses which had a higher domestic opening weekend gross.

**Scoring:** 1 point per correct guess, 10 rounds per game.

**Streak:** In-game streak counter resets on wrong answer. Best streak shown in results.

---

## Engagement System Design

### Achievement Auto-Granting

Achievements are evaluated server-side after two events:
1. `POST /api/games` (any game completion)
2. `POST /api/daily-challenge/complete` (daily challenge completion)

The evaluation runs asynchronously (non-blocking) using `.catch()` for error isolation.

**Evaluation Logic:**

Each achievement has a `key` that maps to a specific condition:

| Key | Evaluation Method |
|-----|------------------|
| first_game | Count sessions >= 1 |
| ten_games | Count sessions >= 10 |
| fifty_games | Count sessions >= 50 |
| trivia_perfect | Current game is trivia AND score == totalQuestions AND totalQuestions >= 10 |
| trivia_streak_5 | Current game is trivia AND score >= 5 |
| draft_first_win | Current game is draft AND score > 0 |
| draft_three_wins | Count draft sessions with score > 0 >= 3 |
| boxoffice_streak_5 | Current game is boxoffice AND score >= 5 |
| boxoffice_8_of_10 | Current game is boxoffice AND score >= 8 |
| daily_streak_3 | Profile currentStreak >= 3 |
| daily_streak_7 | Profile currentStreak >= 7 |

**Idempotency:** Before granting, the system checks if the achievement is already earned. This prevents duplicate grants.

### Streak Tracking

Streaks are based on consecutive daily challenge completions:

```
Day 1: Complete -> streak = 1
Day 2: Complete -> streak = 2
Day 3: Skip     -> (no change until next completion)
Day 4: Complete -> streak = 1 (reset, since Day 3 was missed)
```

The comparison uses `lastChallengeDate`:
- If last challenge was yesterday (by calendar date): increment
- Otherwise: reset to 1

### Deterministic Daily Challenges

The seed is the date as an integer (YYYYMMDD, e.g., 20260206).

When this seed is passed to the trivia question endpoint, questions are ordered by:

```sql
ORDER BY md5(id || seed_value)
```

This produces a deterministic but pseudo-random ordering that is:
- The same for all players on the same day
- Different each day
- Not predictable without knowing the seed algorithm

---

## Security Model

### Authentication

The mobile app uses a **username-only profile system** (no passwords). This is by design for a casual game app:
- Profiles are identified by UUID stored in AsyncStorage
- Usernames are unique but not secret
- No session tokens or JWT; the profileId is passed as a query parameter or request body field

### Input Validation

All POST endpoints validate input using Zod schemas derived from the Drizzle table definitions:

```typescript
const validatedData = insertGameSessionSchema.parse(req.body);
```

Invalid input returns 400 with field-level error details.

### SQL Injection Prevention

All database queries use Drizzle ORM's parameterized query builder. No raw SQL string concatenation occurs.

### Admin Endpoints

The `/api/admin/*` endpoints have no authentication. In a production deployment, these should be:
- Removed from the mobile app navigation
- Protected with authentication middleware
- Or disabled entirely

---

## Design Decisions

### Why No Authentication?

For a hackathon game app, authentication adds friction without proportional benefit. Players identify by username, and the profile system provides sufficient identity for leaderboards and achievements.

### Why AsyncStorage + Server?

The dual storage approach provides:
- **Offline resilience**: Profile data persists locally even if the server is unreachable
- **Cross-device continuity**: Server-side profiles can be accessed from any device
- **Fast startup**: No network call needed to display the username on launch

### Why Seeded Randomization for Daily Challenges?

Using `md5(id || seed)` for ordering ensures:
- All players get the same questions on the same day
- No server-side state needed to track "today's questions"
- The challenge is reproducible for debugging

### Why Async Achievement Checking?

Achievement evaluation queries multiple tables (achievements, user_achievements, profiles, game_sessions). Running this synchronously would add 50-100ms to every game save response. The async approach returns the game session immediately while achievements are processed in the background.

### Why No Caching?

At the current scale (tens to hundreds of users), PostgreSQL handles all queries within acceptable latency. Caching would add infrastructure complexity without measurable benefit. If the app scales significantly, Redis caching for leaderboards and daily challenges would be the first optimization.

---

## Technology Rationale

| Choice | Rationale |
|--------|----------|
| React Native / Expo | Cross-platform mobile development, Replit Mobile App Challenge requirement |
| Expo Router | File-based routing matches mental model of screen-per-file |
| Express 5 | Lightweight, well-understood Node.js HTTP framework |
| Drizzle ORM | Type-safe SQL builder with PostgreSQL dialect, Zod integration |
| PostgreSQL | Robust relational database, provided by Replit |
| Zod | Runtime schema validation with TypeScript type inference |
| AsyncStorage | Standard React Native local persistence |
| expo-haptics | Native haptic feedback without ejecting from Expo |
| Vitest | Fast test runner with TypeScript support |
