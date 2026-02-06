# CineGame Testing Guide

Test strategy, running tests, and writing new tests.

---

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Files](#test-files)
- [Unit Tests](#unit-tests)
- [API Integration Tests](#api-integration-tests)
- [Manual Testing](#manual-testing)
- [Writing New Tests](#writing-new-tests)
- [Test Data](#test-data)
- [Coverage](#coverage)

---

## Overview

CineGame uses **Vitest** as its test runner. The test suite covers:

| Test Type | Tool | Files | Purpose |
|-----------|------|-------|---------|
| Unit | Vitest | `tests/scoring.test.ts` | Battle scoring logic, stat weights, synergy bonuses |
| Integration | Vitest + Supertest | `tests/api.test.ts` | API endpoint responses, request validation |
| Manual | Expo Go | N/A | UI/UX, game flows, mobile-specific behavior |

---

## Running Tests

There are no npm scripts for tests. Run Vitest directly using `npx`:

### Run All Tests

```bash
npx vitest run
```

### Run a Specific File

```bash
npx vitest run tests/scoring.test.ts
npx vitest run tests/api.test.ts
```

### Watch Mode (Re-run on File Changes)

```bash
npx vitest
```

### Run with Verbose Output

```bash
npx vitest run --reporter=verbose
```

---

## Test Files

### tests/scoring.test.ts

Tests the battle scoring functions used in Movie Draft mode.

**What it covers:**

- `calculateWeightedScore(athlete)` - Verifies that each stat is multiplied by its correct weight
- `calculateTeamScore(athletes)` - Verifies team totals including synergy bonuses
- Edge cases: empty teams, single-player teams, all-same-archetype teams

**Key functions tested:**

```typescript
// From server/routes.ts
calculateWeightedScore(athlete: MovieAthlete): number
calculateTeamScore(athletes: MovieAthlete[]): number
```

**Stat weight reference:**

| Stat | Weight |
|------|--------|
| heart | 1.3 |
| clutch | 1.2 |
| teamwork | 1.2 |
| leadership | 1.1 |
| athleticism | 1.0 |
| skill | 1.0 |
| intimidation | 0.8 |
| charisma | 0.7 |

**Synergy bonus reference:**

| Condition | Bonus |
|-----------|-------|
| Captain archetype present | +50 |
| Veteran + Underdog | +30 |
| Natural + Teammate | +25 |
| 4+ unique archetypes | +40 |

---

### tests/api.test.ts

Tests API endpoints using Supertest to make HTTP requests against the running server.

**What it covers:**

- `GET /api/trivia/questions` - Returns the requested number of questions
- `GET /api/trivia/stats` - Returns total question count
- `GET /api/movies` - Returns movie list
- `GET /api/athletes` - Returns athlete list
- `POST /api/games` - Saves game sessions, validates input
- Error handling for invalid requests

**Requirements:**

- The Express server must be running (or the test must start its own server instance)
- A PostgreSQL database must be accessible via `DATABASE_URL`
- Seeded data must exist in the database

---

## Manual Testing

### Mobile App Testing Checklist

For each release, verify the following on a physical device via Expo Go:

#### Profile Flow
- [ ] First launch shows profile creation modal
- [ ] Can create a profile with a valid username
- [ ] Username appears in home screen header
- [ ] Skip option works (profile modal can be dismissed)
- [ ] Profile persists across app restarts (AsyncStorage)

#### Trivia Quiz
- [ ] 10 questions load successfully
- [ ] Answer selection provides correct/incorrect feedback
- [ ] Haptic feedback fires on answer selection
- [ ] Hint button shows hint text
- [ ] Score increments on correct answers
- [ ] Progress bar advances with each question
- [ ] Game over screen shows final score
- [ ] Share button generates text and opens share sheet
- [ ] Play Again reloads fresh questions

#### Daily Challenge
- [ ] Daily challenge card appears on home screen
- [ ] Tapping starts trivia with seeded questions
- [ ] Completing marks the challenge as done (green checkmark)
- [ ] Streak counter increments
- [ ] Fire icon appears with streak count

#### Movie Draft
- [ ] Athletes load by archetype round
- [ ] Tapping an athlete drafts them to your team
- [ ] Opponent auto-drafts after your pick
- [ ] Battle screen shows both team lineups
- [ ] Battle calculates scores with breakdowns
- [ ] Results screen shows winner and score comparison
- [ ] Haptic feedback on draft pick and battle result
- [ ] Share button works

#### Box Office Heads Up
- [ ] Two movies appear with poster/metadata
- [ ] Tapping a movie reveals opening weekend amounts
- [ ] Correct/incorrect feedback shows
- [ ] Haptic feedback on guess
- [ ] Streak counter tracks consecutive correct guesses
- [ ] After 10 rounds, game over screen shows
- [ ] Share button works

#### Stats Screen
- [ ] My Stats tab shows game history and overview numbers
- [ ] Leaderboard tab shows ranked players
- [ ] Leaderboard filters by game type and period
- [ ] Badges tab shows earned/locked achievements
- [ ] Pull to refresh updates all data

#### Theme
- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly
- [ ] All text is readable in both modes

---

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "../server/routes";

describe("myFunction", () => {
  it("should handle the basic case", () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it("should handle edge cases", () => {
    expect(myFunction(null)).toBe(defaultValue);
    expect(myFunction([])).toBe(emptyResult);
  });
});
```

### API Test Template

```typescript
import { describe, it, expect } from "vitest";
import supertest from "supertest";

const API_BASE = "http://localhost:5000";

describe("GET /api/endpoint", () => {
  it("should return 200 with expected data", async () => {
    const response = await supertest(API_BASE)
      .get("/api/endpoint")
      .expect(200);

    expect(response.body).toHaveProperty("expectedField");
  });

  it("should handle missing parameters", async () => {
    const response = await supertest(API_BASE)
      .post("/api/endpoint")
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });
});
```

### Test Naming Conventions

- Describe blocks: use the function or endpoint name
- Test names: use "should [expected behavior]"
- Group related tests with nested describe blocks

---

## Test Data

### Seed Data

The server automatically seeds sample data on first start:

| Data | Count | Source |
|------|-------|--------|
| Trivia questions | 38,505 | `server/seed.ts` |
| Movies | ~20 | `server/seed.ts` |
| Movie athletes | 58 | `server/seed.ts` |
| Achievements | 11 | `server/routes.ts` (seedAchievements) |

Tests assume this seed data exists. If running tests against an empty database, start the server first to trigger seeding.

### Test Isolation

Tests do not clean up after themselves. For integration tests that create data (profiles, game sessions), use unique identifiers to avoid conflicts:

```typescript
const testUsername = `test_${Date.now()}`;
```

---

## Coverage

### Current Coverage Areas

| Area | Coverage | Notes |
|------|----------|-------|
| Scoring logic | High | Unit tests for all stat weights and synergy bonuses |
| API endpoints (read) | Medium | Basic response validation |
| API endpoints (write) | Medium | Game session creation tested |
| Achievement logic | Low | Tested indirectly via game session creation |
| Daily challenge logic | Low | Tested via manual testing |
| Frontend components | None | Manual testing only (React Native) |

### Priority Areas for Additional Tests

1. **Achievement granting**: Test each achievement condition in isolation
2. **Streak calculation**: Test edge cases (consecutive days, skipped days, timezone boundaries)
3. **Leaderboard aggregation**: Test ranking with multiple profiles and game types
4. **Profile creation**: Test duplicate username handling, character limits
5. **Daily challenge seeding**: Verify same seed produces same questions
