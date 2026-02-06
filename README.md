# CineGame

A movie trivia and challenges app built with React Native / Expo (mobile) and React / Vite (web), backed by an Express API server. Three game modes test your film knowledge while an engagement system tracks your progress, ranks you against other players, and rewards achievements.

Built for the Replit Mobile App Challenge hackathon.

The app has two frontends:
- **Mobile**: React Native / Expo with file-based routing (primary, in `app/` directory)
- **Web**: React / Vite with wouter routing (in `client/` directory, served by the Express server)

## Features

### Game Modes

**Trivia Quiz** - Answer multiple-choice movie questions drawn from a pool of 38,505 questions spanning categories like Directors, Awards, Actors, and Box Office. Questions include optional hints and cover easy, medium, and hard difficulty levels.

**Movie Draft** - Draft a team of five movie characters by archetype (Captain, Natural, Underdog, Veteran, Villain, Teammate, Wildcard), then battle against a randomly drafted opponent team. Scores are calculated using weighted stats (athleticism, clutch, leadership, heart, skill, intimidation, teamwork, charisma) with synergy bonuses for complementary archetypes.

**Box Office Heads Up** - Given two movies, guess which one had the bigger opening weekend. Play 10 rounds per game, track your in-game streak, and try to beat your best score.

### Engagement System

**Player Profiles** - Create a username on first launch. Your profile persists locally (AsyncStorage) and on the server, linking all your scores, streaks, and achievements.

**Daily Challenges** - Every day, all players receive the same set of 10 trivia questions (deterministic via seeded randomization using the date as seed). Complete daily challenges to build streaks.

**Streaks** - Track your current and longest daily challenge streak. A fire icon badge displays your streak on the home screen and stats page.

**Leaderboards** - See how you rank against other players. Filter by game mode (Trivia, Draft, Box Office) and time period (Weekly or All Time).

**Achievements** - Earn 11 unlockable badges across five categories:

| Badge | Category | Requirement |
|-------|----------|-------------|
| First Steps | General | Play your first game |
| Getting Warmed Up | General | Play 10 games |
| Dedicated Player | General | Play 50 games |
| Perfect Round | Trivia | Score 10/10 in a trivia quiz |
| Trivia Hot Streak | Trivia | Score at least 5 correct in a single round |
| Draft Champion | Draft | Win your first draft battle |
| Draft Dominator | Draft | Win 3 draft battles |
| Box Office Guru | Box Office | Get 5 or more correct in a round |
| Market Analyst | Box Office | Score 8+ in a box office round |
| Consistent Player | Daily | Complete 3 daily challenges in a row |
| Weekly Warrior | Daily | Complete 7 daily challenges in a row |

**Share Results** - Share your game results via the native Share API on every game-over screen.

**Haptic Feedback** - Feel correct and incorrect answers, draft picks, and battle results through device vibration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native 0.76, Expo SDK 52 |
| Routing | Expo Router (file-based, bottom tabs) |
| Backend | Express 5, TypeScript, Node.js |
| Database | PostgreSQL (Neon-backed on Replit) |
| ORM | Drizzle ORM |
| Validation | Zod + drizzle-zod |
| Icons | @expo/vector-icons (Ionicons) |
| Haptics | expo-haptics |
| Local Storage | @react-native-async-storage/async-storage |
| Testing | Vitest |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (provided automatically on Replit)
- Expo Go app on your mobile device (optional, for mobile testing)

### Installation

```bash
npm install
```

### Database Setup

Push the schema to your PostgreSQL database:

```bash
npm run db:push
```

The database will be seeded automatically with sample data (trivia questions, movies, movie athletes) when the server starts for the first time.

### Running the App

**Start the server** (serves both the Express API and the Vite web frontend on port 5000):

```bash
npm run dev
```

The web app is available at `http://localhost:5000`.

**Mobile app** (optional, requires Expo CLI installed globally):

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone to load the mobile app. The mobile app connects to the Express API on port 5000.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Express session secret | Yes |

## Project Structure

```
cinegame/
  app/                    # Expo Router screens (mobile frontend, file-based routing)
    _layout.tsx            # Root layout with bottom tab navigation
    index.tsx              # Home screen (game cards, daily challenge, profile modal)
    trivia.tsx             # Trivia quiz (supports daily challenge mode)
    draft.tsx              # Movie draft and team battle
    boxoffice.tsx          # Box office guessing game
    stats.tsx              # Stats, leaderboards, achievements (3 tabs)
    admin.tsx              # Admin panel for data management
  mobile/                 # Shared mobile code
    constants/
      api.ts               # API client (fetch wrapper with base URL)
      theme.ts             # Colors, Spacing, FontSize, BorderRadius
    hooks/
      useProfile.ts        # AsyncStorage-backed profile hook
  client/                 # React / Vite web frontend (served by Express)
    src/                   # Web app source code, pages, components
  server/                 # Express backend
    index.ts               # Server entry point
    routes.ts              # All API routes + achievement logic
    storage.ts             # IStorage interface + DatabaseStorage
    seed.ts                # Database seeding
    db.ts                  # Database connection (Drizzle + pg)
  shared/
    schema.ts              # Drizzle schema (10 tables), Zod schemas, TypeScript types
  tests/
    scoring.test.ts        # Unit tests for battle scoring
    api.test.ts            # API integration tests
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Express API + Vite web frontend (port 5000) |
| `npm run build` | Build the production server and client bundle |
| `npm start` | Run the production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push Drizzle schema changes to PostgreSQL |

## API Documentation

See [API.md](./API.md) for the complete API reference.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design documentation.

## Runbook

See [RUNBOOK.md](./RUNBOOK.md) for operational procedures, deployment, monitoring, and incident response.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and contribution workflow.

## Testing

See [TESTING.md](./TESTING.md) for test strategy and instructions.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT
