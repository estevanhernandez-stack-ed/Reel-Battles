# Contributing to CineGame

Guidelines for contributing to CineGame.

---

## Table of Contents

- [Development Environment](#development-environment)
- [Code Standards](#code-standards)
- [Project Conventions](#project-conventions)
- [Adding New Features](#adding-new-features)
- [Database Changes](#database-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Content Guidelines](#content-guidelines)

---

## Development Environment

### Setup

1. Clone the repository
2. Run `npm install`
3. Ensure PostgreSQL is available via `DATABASE_URL`
4. Push the schema: `npm run db:push`
5. Start the dev server: `npm run dev` (serves Express API + Vite web frontend on port 5000)
6. Optionally, start Expo for mobile: `npx expo start` (requires Expo CLI)

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Runtime |
| npm | 10+ | Package manager |
| PostgreSQL | 15+ | Database |
| Expo CLI | Latest | Mobile development |
| Expo Go | Latest | Mobile testing on device |

---

## Code Standards

### TypeScript

- Strict TypeScript throughout the codebase
- All data types defined in `shared/schema.ts` using Drizzle + Zod
- Use `z.infer<typeof schema>` for insert types, `typeof table.$inferSelect` for select types
- No `any` types except where interfacing with untyped external data

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | camelCase (components), kebab-case (routes) | `useProfile.ts`, `api.ts` |
| Variables | camelCase | `currentStreak`, `playerTeam` |
| Constants | UPPER_SNAKE_CASE | `STAT_WEIGHTS`, `TEAM_SIZE` |
| Database columns | snake_case | `opening_weekend`, `game_type` |
| TypeScript types | PascalCase | `MovieAthlete`, `GameSession` |
| API routes | kebab-case | `/api/daily-challenge`, `/api/athletes/battle` |

### Backend

- All database access goes through the `IStorage` interface in `server/storage.ts`
- Routes are thin controllers; business logic belongs in storage or helper functions
- Validate all POST request bodies with Zod schemas
- Return consistent JSON error format: `{ error: "message" }`
- Log errors to console with descriptive context

### Frontend (React Native / Expo)

- Use React Native `StyleSheet.create()` for all styles
- Use theme constants from `mobile/constants/theme.ts` (Colors, Spacing, FontSize, BorderRadius)
- Support both light and dark mode via `useColorScheme()`
- Use `Ionicons` from `@expo/vector-icons` for all icons
- Use `SafeAreaView` from `react-native-safe-area-context` as root wrapper

### Formatting

- 2-space indentation
- Double quotes for JSX attributes
- Semicolons required
- Trailing commas in multi-line arrays/objects

---

## Project Conventions

### File Organization

```
shared/schema.ts          # Single source of truth for data types
server/storage.ts         # All database operations
server/routes.ts          # API route handlers
mobile/constants/theme.ts # Design tokens
mobile/constants/api.ts   # API client
mobile/hooks/             # React hooks
app/                      # Expo Router screens
```

### API Design

- RESTful JSON endpoints under `/api/*`
- GET for reads, POST for creates, DELETE for deletes
- Query parameters for filtering and pagination
- Consistent error responses with descriptive messages
- Achievements are checked asynchronously after game saves (non-blocking)

### State Management

- Server is the source of truth for all persistent data
- AsyncStorage is used for local profile caching only
- No global state management library (each screen fetches its own data)
- `useProfile` hook provides profile state across all screens

---

## Adding New Features

### Adding a New Game Mode

1. **Schema**: Add any new tables to `shared/schema.ts`
2. **Storage**: Add CRUD methods to `IStorage` interface and `DatabaseStorage` class
3. **Routes**: Add API endpoints in `server/routes.ts`
4. **Screen**: Create a new screen in `app/newgame.tsx`
5. **Navigation**: The screen is automatically available via Expo Router
6. **Home**: Add a card to `app/index.tsx` game modes array
7. **Achievements**: Add achievement definitions to `ACHIEVEMENT_DEFINITIONS` in `server/routes.ts`
8. **Tests**: Add API tests in `tests/api.test.ts`

### Adding a New Achievement

1. Add the definition to `ACHIEVEMENT_DEFINITIONS` in `server/routes.ts`:
   ```typescript
   { key: "unique_key", name: "Display Name", description: "How to earn", icon: "ionicon-name", category: "general|trivia|draft|boxoffice|daily", threshold: 1 }
   ```
2. Add the evaluation logic in `checkAndGrantAchievements()`:
   ```typescript
   case "unique_key":
     earned = /* your condition */;
     break;
   ```
3. The achievement will be auto-seeded on next server restart
4. Add the icon mapping in `app/stats.tsx` `ACHIEVEMENT_ICONS`

### Adding Trivia Questions

Insert directly into the database:

```sql
INSERT INTO trivia_questions (question, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, category, difficulty)
VALUES ('Question?', 'Correct', 'Wrong1', 'Wrong2', 'Wrong3', 'Category', 'medium');
```

Or add to the seed data in `server/seed.ts` for initial deployments.

### Adding Movies

Use the Admin API:

```bash
curl -X POST http://localhost:5000/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Movie","year":2024,"genre":"Action","openingWeekend":50000000}'
```

Or use the Admin screen in the mobile app.

---

## Database Changes

### Schema Modification Process

1. Edit `shared/schema.ts`
2. Add corresponding insert schema, insert type, and select type
3. Update `IStorage` interface in `server/storage.ts`
4. Implement the methods in `DatabaseStorage` class
5. Push the schema: `npm run db:push`
6. Test the new endpoints

### Rules

- Never change existing primary key column types
- Always use `varchar` with `gen_random_uuid()` default for new ID columns
- Add `createdAt: timestamp("created_at").defaultNow()` to new tables that track history
- Use `text()` for string columns (not `varchar` with length constraints)
- Use `.notNull()` for required fields, leave optional fields without it

---

## Testing

### Running Tests

Tests use Vitest. Note that there are no npm scripts for tests; run Vitest directly:

```bash
# Run all tests (requires vitest as a dev dependency)
npx vitest run

# Run specific test file
npx vitest run tests/scoring.test.ts

# Watch mode
npx vitest
```

### Test Structure

- `tests/scoring.test.ts` - Unit tests for battle scoring logic
- `tests/api.test.ts` - API integration tests

### Writing Tests

- Place test files in the `tests/` directory
- Use `describe` blocks to group related tests
- Test both success and error cases
- For API tests, use supertest against the running server
- For scoring tests, test edge cases (empty teams, single player, etc.)

See [TESTING.md](./TESTING.md) for more details.

---

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the code standards above
3. Run `npx vitest run` and ensure all tests pass
4. Run `npm run check` and fix any TypeScript errors
5. Test on a physical device using Expo Go
6. Create a pull request with:
   - Description of the change
   - Screenshots for UI changes
   - Any new API endpoints documented
   - Database schema changes noted
7. Address review feedback
8. Merge after approval

---

## Content Guidelines

### Trivia Questions

- Questions should have exactly one correct answer and three plausible wrong answers
- Categories: Directors, Awards, Actors, Box Office, Release Dates, or custom
- Difficulty: easy (common knowledge), medium (movie fan), hard (film buff)
- Avoid ambiguous questions where multiple answers could be correct
- Include the `movieTitle` field when the question relates to a specific film
- Optional `hint` should help narrow down the answer without giving it away

### Movies

- `openingWeekend` should be the domestic (US) opening weekend gross in USD
- Include `director`, `rating`, and `synopsis` when available
- `genre` should be a single primary genre (Action, Comedy, Drama, Sci-Fi, etc.)

### Movie Athletes

- Characters should be recognizable movie characters who participate in sports
- 8 stats should be in the 0-99 range, reflecting the character's traits
- `archetype` must be one of: captain, natural, underdog, veteran, villain, teammate, wildcard
- `bio` should explain the character's stat rationale
- `quote` should be a memorable line from the character
