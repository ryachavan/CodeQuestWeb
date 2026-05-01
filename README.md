# CodeQuest

CodeQuest is a gamified programming learning platform built to make coding education interactive, rewarding, and fun. Featuring dynamic language learning paths, daily quests, global leaderboards, and unlockable profile cosmetics.

**Live Deployment:** [https://code-quest-swart.vercel.app/](https://code-quest-swart.vercel.app/)

<video width="100%" controls>
  <source src="https://6bd7svqfh19e4jqj.public.blob.vercel-storage.com/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Features

*   **Interactive Learning Modules:** Path-based learning with a module/lesson structure and three question types: multiple choice, code assembly, and fill-in-the-blank.
*   **Gamified Progression:** Earn XP and Coins by completing lessons (scoring ≥ 60%). Maintain streaks by learning daily.
*   **Unlockable Cosmetics:** Use earned coins to purchase custom Avatars (e.g., `fox-coder`, `holo-wizard`) and UI Themes (e.g., `solar-flare`, `matrix-green`) from the store.
*   **Daily Quests:** Complete rotating daily objectives for massive XP and coin boosts.
*   **Global Leaderboard:** Compete with other learners globally based on total XP.

## Tech Stack

*   **Framework:** Next.js 16 (App Router, Turbopack)
*   **UI Library:** React 19
*   **Language:** TypeScript (Strict Mode)
*   **Styling:** Tailwind CSS v4 + Custom Theme CSS Variables
*   **Animations:** Framer Motion
*   **Backend & Auth:** Supabase (Postgres Database, Row Level Security, SSR Auth)
*   **State Management:** Zustand (with local persistence)
*   **Data Fetching:** SWR (Stale-While-Revalidate caching)

## Architecture & Security

### Route Protection (Two-Layer Security)
Access to `/dashboard/*` is strictly protected:
1.  **Server-Side (`src/proxy.ts`):** Next.js middleware intercepts requests at the edge and redirects unauthenticated users to `/login` if Supabase is connected.
2.  **Client-Side (`src/components/ProtectedRoute.tsx`):** A wrapper component prevents "flashes" of unauthenticated content and gracefully handles local Demo Mode sessions.

### Data Flow & Performance
*   **Supabase Singleton:** Database connections use a shared `getClient()` singleton pattern to prevent auth-lock race conditions.
*   **Debounced Syncing:** Rapid state mutations (e.g., claiming quests, adding XP) are debounced before syncing to the cloud via `saveToSupabase` to minimize database writes.
*   **Dynamic Store Economy:** The store's pricing is scaled dynamically at the API layer (`src/lib/dataApi.ts`) to align perfectly with the average coin output of quizzes and quests.

## Getting Started

### 1. Installation
Clone the repository and install dependencies using `npm`. *(Note: This project strictly uses `package-lock.json` and overrides `postcss` to prevent vulnerabilities).*

```bash
git clone https://github.com/ryachavan/codequest.git
cd codequest
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
# Alternatively: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: If no Supabase keys are provided, the app will automatically fall back to **Demo Mode**, utilizing local storage for progression.*

### 3. Database Setup (Supabase)
Run the SQL migrations located in `supabase/migrations/` sequentially in your Supabase SQL Editor to bootstrap the necessary tables (`user_profiles`, `lessons`, `themes`, `avatars`, etc.) and Row Level Security (RLS) policies.

### 4. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to start exploring.

## Project Structure

```text
src/
├── app/
│   ├── dashboard/        # Protected app interface (Learn, Profile, Store)
│   ├── login/            # Auth pages
│   ├── signup/           # Auth pages
│   ├── layout.tsx        # Global shell & providers
│   └── page.tsx          # Marketing Landing Page
├── components/           # Reusable UI (Sidebar, Topbar, AuthSync, ProtectedRoute)
├── lib/
│   ├── dataApi.ts        # Primary data fetching and business logic
│   ├── supabaseClient.ts # Supabase client singleton configuration
│   ├── types.ts          # Shared TypeScript interfaces
│   └── languageUi.ts     # Visual mappings for languages
├── store/
│   └── userStore.ts      # Zustand state for progression, cosmetics, & persistence
└── proxy.ts              # Next.js Middleware for server-side auth protection
```
## Technical Optimizations

CodeQuest is aggressively optimized to provide a frictionless, near-instantaneous user experience while keeping cloud resource utilization low.

*   **Network Debouncing:** Rapid state mutations—such as claiming multiple quests or accumulating lesson XP—are batched and debounced before syncing via `saveToSupabase`. This drastically reduces backend database write operations and prevents rate-limiting.
*   **Intelligent Client Caching:** Integrated SWR (Stale-While-Revalidate) ensures that data models like catalogs, user profiles, and lesson modules are cached locally and fetched lazily. This allows instant page transitions without blocking the UI rendering thread.
*   **Supabase Singleton Architecture:** Supabase connections are brokered through a unified `getClient()` singleton pattern, eradicating memory leaks, duplicate WebSocket handshakes, and auth-state race conditions across parallel components.
*   **Security & Build Integrity:** Lockfiles and dependencies are strictly audited. Overridden transitive dependencies (e.g., forcing `postcss@^8.5.10`) proactively patch build-time XSS vulnerabilities without relying on aggressive auto-fix commands that corrupt dependency trees.
*   **Dynamically Scaled Economy:** The frontend acts as a smart layer on top of the backend, mapping and recalculating database cosmetic pricing on the fly to perfectly align with the user's average coin acquisition rate—keeping the platform engaging without constant database migrations.
