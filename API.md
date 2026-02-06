# CineGame API Reference

Base URL: `http://localhost:5000`

All endpoints return JSON. POST endpoints accept `Content-Type: application/json`.

---

## Table of Contents

- [Game Endpoints](#game-endpoints)
  - [Trivia](#trivia)
  - [Movies](#movies)
  - [Athletes & Draft](#athletes--draft)
  - [Game Sessions](#game-sessions)
- [Engagement Endpoints](#engagement-endpoints)
  - [Profiles](#profiles)
  - [Daily Challenges](#daily-challenges)
  - [Leaderboards](#leaderboards)
  - [Achievements](#achievements)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Data Types](#data-types)

---

## Game Endpoints

### Trivia

#### GET /api/trivia/questions

Fetch random trivia questions. Optionally provide a seed for deterministic results (used for daily challenges).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of questions to return |
| `seed` | integer | (random) | Seed for deterministic question selection |

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "question": "Who directed 'The Godfather' (1972)?",
    "correctAnswer": "Francis Ford Coppola",
    "wrongAnswer1": "Martin Scorsese",
    "wrongAnswer2": "Steven Spielberg",
    "wrongAnswer3": "Stanley Kubrick",
    "category": "Directors",
    "difficulty": "easy",
    "hint": "He also directed Apocalypse Now",
    "movieTitle": "The Godfather"
  }
]
```

**Example:**

```bash
# Random questions
curl "http://localhost:5000/api/trivia/questions?limit=10"

# Seeded questions (daily challenge)
curl "http://localhost:5000/api/trivia/questions?limit=10&seed=20260206"
```

---

#### GET /api/trivia/stats

Get the total number of trivia questions in the database.

**Response:** `200 OK`

```json
{
  "totalQuestions": 38505,
  "source": "postgresql"
}
```

---

### Movies

#### GET /api/movies

Fetch all movies.

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "title": "Avatar",
    "year": 2009,
    "posterUrl": null,
    "openingWeekend": 77025481,
    "genre": "Sci-Fi",
    "director": "James Cameron",
    "rating": "PG-13",
    "synopsis": "A paraplegic Marine..."
  }
]
```

---

#### GET /api/movies/random

Fetch random movies (used for Box Office Heads Up).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 2 | Number of movies to return |

**Response:** `200 OK` - Array of movie objects.

---

### Athletes & Draft

#### GET /api/athletes

Fetch all movie athletes. Optionally filter by archetype.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `archetype` | string | (all) | Filter by archetype: captain, natural, underdog, veteran, villain, teammate, wildcard |

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "Herman Boone",
    "movie": "Remember the Titans",
    "movieYear": 2000,
    "sport": "Football",
    "actor": "Denzel Washington",
    "archetype": "captain",
    "bio": "99 Leadership for integrating T.C. Williams...",
    "quote": "I don't care if you like each other or not.",
    "athleticism": 42,
    "clutch": 88,
    "leadership": 99,
    "heart": 92,
    "skill": 85,
    "intimidation": 94,
    "teamwork": 95,
    "charisma": 82,
    "wildcardName": "Unity",
    "wildcardCategory": "Social",
    "wildcardValue": 99
  }
]
```

---

#### GET /api/athletes/random

Fetch random athletes.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 2 | Number of athletes to return |

---

#### POST /api/athletes/battle

Calculate the result of a team battle.

**Request Body:**

```json
{
  "playerTeam": [/* array of MovieAthlete objects */],
  "opponentTeam": [/* array of MovieAthlete objects */]
}
```

**Response:** `200 OK`

```json
{
  "playerScore": 2150,
  "opponentScore": 1980,
  "winner": "player",
  "playerBreakdown": [
    { "name": "Herman Boone", "score": 430 }
  ],
  "opponentBreakdown": [
    { "name": "Rocky Balboa", "score": 396 }
  ]
}
```

**Scoring Logic:**

Stats are weighted:
- Heart: 1.3x
- Clutch: 1.2x
- Teamwork: 1.2x
- Leadership: 1.1x
- Athleticism: 1.0x
- Skill: 1.0x
- Intimidation: 0.8x
- Charisma: 0.7x

Synergy bonuses:
- Captain on team: +50
- Veteran + Underdog: +30
- Natural + Teammate: +25
- 4+ unique archetypes: +40

---

### Game Sessions

#### POST /api/games

Save a game session. If `profileId` is provided, achievements are checked and potentially granted.

**Request Body:**

```json
{
  "profileId": "uuid (optional)",
  "gameType": "trivia | draft | boxoffice | daily",
  "score": 8,
  "totalQuestions": 10
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "profileId": "uuid",
  "gameType": "trivia",
  "score": 8,
  "totalQuestions": 10,
  "createdAt": "2026-02-06T00:00:00.000Z"
}
```

---

#### GET /api/games

Fetch game session history.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `profileId` | string | (all) | Filter sessions by profile |
| `gameType` | string | (all) | Filter by game type |

**Response:** `200 OK` - Array of game session objects.

---

## Engagement Endpoints

### Profiles

#### POST /api/profiles

Create a new profile or return an existing one if the username already exists.

**Request Body:**

```json
{
  "username": "PlayerName"
}
```

**Validation:**
- Username must be at least 2 characters
- Username must be a string

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "username": "PlayerName",
  "currentStreak": 0,
  "longestStreak": 0,
  "lastChallengeDate": null,
  "totalGamesPlayed": 0,
  "createdAt": "2026-02-06T00:00:00.000Z"
}
```

---

#### GET /api/profiles/:id

Fetch a profile by ID.

**Response:** `200 OK` - Profile object.

**Error:** `404 Not Found` if profile does not exist.

---

### Daily Challenges

#### GET /api/daily-challenge

Get today's daily challenge. Creates one automatically if it does not exist for today. If `profileId` is provided, includes whether the player has already completed today's challenge.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `profileId` | string | (none) | Check completion status for this profile |

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "challengeDate": "2026-02-06",
  "gameType": "trivia",
  "seed": 20260206,
  "createdAt": "2026-02-06T00:00:00.000Z",
  "completed": false
}
```

**How the seed works:**

The seed is the date formatted as `YYYYMMDD` integer (e.g., `20260206`). When passed to `/api/trivia/questions?seed=20260206`, it returns the same set of questions for all players on that day.

---

#### POST /api/daily-challenge/complete

Mark today's daily challenge as completed for a player. Updates the player's streak and grants any earned achievements.

**Request Body:**

```json
{
  "profileId": "uuid",
  "score": 8,
  "totalQuestions": 10
}
```

**Response:** `200 OK`

```json
{
  "streak": 3,
  "longestStreak": 5
}
```

If already completed today:

```json
{
  "alreadyCompleted": true,
  "streak": 0
}
```

**Streak Logic:**

- If the player completed yesterday's challenge, increment the streak
- If the player missed yesterday, reset the streak to 1
- The longest streak is updated if the current streak exceeds it

---

### Leaderboards

#### GET /api/leaderboard

Get ranked players for a specific game type and time period.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gameType` | string | `trivia` | Game type: trivia, draft, boxoffice |
| `period` | string | `alltime` | Time period: weekly (last 7 days), alltime |
| `limit` | integer | 20 | Maximum number of entries to return |

**Response:** `200 OK`

```json
[
  {
    "profileId": "uuid",
    "username": "TopPlayer",
    "totalScore": "85",
    "gamesPlayed": "10"
  }
]
```

**Note:** `totalScore` and `gamesPlayed` are returned as strings due to PostgreSQL aggregation. Parse them as numbers on the client.

---

### Achievements

#### GET /api/achievements

Get all achievement definitions. If `profileId` is provided, includes whether the player has earned each achievement.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `profileId` | string | (none) | Include earned status for this profile |

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "key": "first_game",
    "name": "First Steps",
    "description": "Play your first game",
    "icon": "star",
    "category": "general",
    "threshold": 1,
    "earned": true,
    "earnedAt": "2026-02-06T00:00:00.000Z"
  }
]
```

**Achievement Auto-Granting:**

Achievements are checked and granted automatically when:
1. A game session is saved with a `profileId` (via `POST /api/games`)
2. A daily challenge is completed (via `POST /api/daily-challenge/complete`)

The check runs asynchronously and does not block the API response.

---

## Admin Endpoints

### POST /api/admin/movies

Create a new movie.

**Request Body:**

```json
{
  "title": "Movie Title",
  "year": 2024,
  "genre": "Action",
  "openingWeekend": 50000000,
  "director": "Director Name",
  "posterUrl": "https://example.com/poster.jpg",
  "rating": "PG-13",
  "synopsis": "Movie description"
}
```

**Required fields:** title, year, genre, openingWeekend

---

### DELETE /api/admin/movies/:id

Delete a movie by ID.

**Response:** `200 OK`

```json
{ "success": true }
```

---

### POST /api/admin/athletes

Create a new movie athlete. Stats are randomly generated (60-90 range).

**Request Body:**

```json
{
  "name": "Character Name",
  "movie": "Movie Title",
  "movieYear": 2024,
  "sport": "Basketball",
  "actor": "Actor Name",
  "archetype": "captain",
  "bio": "Character bio",
  "quote": "Character quote"
}
```

**Required fields:** name, movie, movieYear, sport, actor, archetype

---

### DELETE /api/admin/athletes/:id

Delete an athlete by ID.

**Response:** `200 OK`

```json
{ "success": true }
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

For validation errors (Zod):

```json
{
  "error": "Invalid game session data",
  "details": [
    { "field": "gameType", "message": "Required" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing or invalid fields) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Data Types

### TriviaQuestion

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| question | string | Question text |
| correctAnswer | string | Correct answer |
| wrongAnswer1 | string | Wrong option 1 |
| wrongAnswer2 | string | Wrong option 2 |
| wrongAnswer3 | string | Wrong option 3 |
| category | string | Question category |
| difficulty | string | easy, medium, or hard |
| hint | string or null | Optional hint |
| movieTitle | string or null | Related movie title |

### Movie

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| title | string | Movie title |
| year | integer | Release year |
| posterUrl | string or null | Poster image URL |
| openingWeekend | integer | Opening weekend gross in USD |
| genre | string | Movie genre |
| director | string or null | Director name |
| rating | string or null | MPAA rating |
| synopsis | string or null | Movie description |

### MovieAthlete

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Character name |
| movie | string | Source movie |
| movieYear | integer | Movie release year |
| sport | string | Sport category |
| actor | string | Actor name |
| archetype | string | captain, natural, underdog, veteran, villain, teammate, wildcard |
| bio | string or null | Character description |
| quote | string or null | Character quote |
| athleticism | integer (0-99) | Physical ability |
| clutch | integer (0-99) | Performance under pressure |
| leadership | integer (0-99) | Leadership quality |
| heart | integer (0-99) | Determination |
| skill | integer (0-99) | Technical skill |
| intimidation | integer (0-99) | Intimidation factor |
| teamwork | integer (0-99) | Team collaboration |
| charisma | integer (0-99) | Personal magnetism |
| wildcardName | string or null | Special ability name |
| wildcardCategory | string or null | Special ability category |
| wildcardValue | integer or null | Special ability value |

### Profile

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| username | string | Player display name (unique) |
| currentStreak | integer | Current daily challenge streak |
| longestStreak | integer | Best daily challenge streak ever |
| lastChallengeDate | string or null | Date of last completed challenge (YYYY-MM-DD) |
| totalGamesPlayed | integer | Total games across all modes |
| createdAt | timestamp | Profile creation date |

### GameSession

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| profileId | string or null | Associated profile |
| gameType | string | trivia, draft, boxoffice, or daily |
| score | integer | Points scored |
| totalQuestions | integer | Total possible points |
| createdAt | timestamp | Session timestamp |

### Achievement

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| key | string | Unique achievement key |
| name | string | Display name |
| description | string | How to earn it |
| icon | string | Ionicons icon name |
| category | string | general, trivia, draft, boxoffice, daily |
| threshold | integer | Numeric threshold for the achievement |
