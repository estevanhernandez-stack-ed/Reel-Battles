# CineGame - Movie Trivia & Challenges

## Overview

CineGame is a movie trivia and gaming web application that offers three interactive game modes for film enthusiasts:

1. **Trivia Quiz** - Multiple-choice movie knowledge questions across categories and difficulty levels
2. **Movie Draft** - Head-to-head card battle comparing movies on various attributes
3. **Box Office Heads Up** - Guess which movie had the bigger opening weekend

The application uses a monorepo structure with a React frontend and Express backend, sharing TypeScript types and schemas between both layers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/UI component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming (light/dark mode support)
- **Animations**: Framer Motion for page transitions and interactive elements

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Runtime**: Node.js with tsx for development
- **API Design**: RESTful JSON API endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration

### Data Layer
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Tables**:
  - `users` - User accounts with username/password
  - `trivia_questions` - Quiz questions with correct/wrong answers, category, difficulty
  - `movies` - Movie data including title, year, poster, opening weekend, genre
  - `game_sessions` - Game history tracking scores and game types

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/ui/  # Shadcn UI components
│       ├── pages/          # Route components (home, trivia, draft, boxoffice)
│       ├── hooks/          # Custom React hooks
│       └── lib/            # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database access layer
│   ├── seed.ts       # Database seeding with sample data
│   └── db.ts         # Database connection
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle schema definitions
└── migrations/       # Database migrations (Drizzle Kit)
```

### Build Process
- **Development**: `npm run dev` - runs tsx with Vite dev server
- **Production Build**: `npm run build` - builds client with Vite, bundles server with esbuild
- **Database**: `npm run db:push` - pushes schema changes to database

## External Dependencies

### Database
- **PostgreSQL** - Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle Kit** - Database migrations and schema management

### UI Framework
- **Radix UI** - Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Shadcn/UI** - Pre-styled component library using Radix primitives

### Key Runtime Dependencies
- **express** - Web server framework
- **drizzle-orm** - Type-safe ORM for PostgreSQL
- **@tanstack/react-query** - Server state management
- **framer-motion** - Animation library
- **zod** - Schema validation
- **wouter** - Client-side routing

### Development Tools
- **Vite** - Frontend build tool with React plugin
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Production server bundling
- **Tailwind CSS** - Utility-first CSS framework