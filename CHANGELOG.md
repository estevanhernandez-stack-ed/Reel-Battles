# Changelog

All notable changes to CineGame are documented in this file.

---

## [1.0.0] - 2026-02-06

### Added

#### Game Modes
- **Trivia Quiz**: 10-question multiple-choice rounds with hint system, difficulty badges, and category labels
- **Movie Draft**: 7-round archetype-based drafting with team battle using weighted stats and synergy bonuses
- **Box Office Heads Up**: 10-round opening weekend comparison game with streak tracking

#### Engagement System
- **Player Profiles**: Username-based profiles with AsyncStorage local persistence and server-side storage
- **Profile Modal**: First-launch username creation flow with skip option
- **Daily Challenges**: Deterministic daily trivia using date-based seeding (same questions for all players)
- **Streak Tracking**: Current and longest streak counters with fire icon badge on home and stats screens
- **Leaderboards**: Weekly and all-time rankings filtered by game mode (trivia, draft, boxoffice)
- **Achievements**: 11 unlockable badges across 5 categories (general, trivia, draft, boxoffice, daily) with server-side auto-granting
- **Share Results**: Native Share API integration on all game-over screens with formatted text summaries
- **Haptic Feedback**: Vibration on correct/incorrect answers, draft picks, and battle results via expo-haptics

#### Backend
- Express 5 API server with 20+ endpoints
- PostgreSQL database with 10 tables via Drizzle ORM
- Zod request validation on all POST endpoints
- Automatic database seeding for trivia questions, movies, and movie athletes
- Achievement auto-seeding on server startup
- Leaderboard aggregation with weekly/all-time periods

#### Mobile App
- React Native 0.76 with Expo SDK 52
- Expo Router file-based routing with bottom tab navigation (Play, Stats, Admin)
- Light and dark mode support via `useColorScheme()`
- Cinematic theme with gold accents and red primary colors
- Safe area handling for all device types

#### Web Frontend
- React / Vite web client with wouter routing
- TanStack Query for data fetching
- shadcn/ui component library
- Served by Express on port 5000

#### Database
- `users` - Legacy table (not used by the app)
- `trivia_questions` - 38,505 quiz questions
- `movies` - Movie data with opening weekend figures
- `movie_athletes` - 58 movie characters with 8 stats and wildcard abilities
- `game_sessions` - Game history with profile linking
- `profiles` - Player profiles with streak data
- `daily_challenges` - Daily challenge definitions
- `user_daily_progress` - Per-user daily completion records
- `achievements` - 11 achievement definitions
- `user_achievements` - Earned achievement records

#### Testing
- Unit tests for battle scoring logic (weighted stats, synergy bonuses)
- API integration tests for game endpoints

#### Documentation
- README with feature overview, tech stack, setup instructions
- Complete API reference (API.md)
- Operational runbook (RUNBOOK.md)
- Architecture documentation (ARCHITECTURE.md)
- Contributing guidelines (CONTRIBUTING.md)
- Test documentation (TESTING.md)
