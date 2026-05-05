# ScoreHub Live 🏏⚽🏀

A full-stack, real-time sports scoring application built with **React**, **TypeScript**, **Vite**, and **Supabase**.

ScoreHub Live allows users to follow live matches with instant updates, while administrators can manage teams, players, and match events through a premium "Match Control Room" dashboard.

## 🚀 Features

### For Users
-   **Live Scores**: Real-time updates for Cricket, Football, and Basketball.
-   **Match Timeline**: detailed event feed (boundaries, wickets, goals) as they happen.
-   **Favorites**: Pin matches to the top of your feed.
-   **Responsive Design**: distinct mobile and desktop layouts for optimal viewing.

### For Admins
-   **Match Control Room**: A premium, 3-column dashboard to manage live games.
    -   **Quick Actions**: Single-tap scoring (1, 4, 6, Wicket, etc.).
    -   **Live Status**: Toggle matches between Upcoming, Live, Paused, and Completed.
    -   **Event Feed**: Push commentary and events directly to the user timeline.
-   **Management**: CRUD operations for Teams, Players, and Matches.

## 🛠 Tech Stack

-   **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI.
-   **Backend**: Supabase (PostgreSQL, Auth, Realtime).
-   **State Management**: React Query (TanStack Query).
-   **Icons**: Lucide React.

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+)
-   npm or bun
-   A Supabase project

### 1. Clone the Repository
```bash
git clone https://github.com/tanmayshah7424-ship-it/live-score-hub.git
cd live-score-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the SQL migrations in your Supabase SQL Editor to set up the schema and security policies. 
You can find the migration files in the `supabase/migrations` folder. 

**Key Tables:**
-   `profiles`: User data.
-   `teams`: Sports teams metadata.
-   `players`: Player rosters.
-   `matches`: Core match data (scores, teams, status).
-   `match_events`: Timeline events (runs, goals, commentary).

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) to view the app.

## 🔒 Authentication & Admin Access
The app uses Supabase Auth. To access the Admin Dashboard:
1.  Sign up as a new user.
2.  Manually assign the `admin` role to your user in the `user_roles` table in Supabase.
3.  Navigate to `/admin`.

## 📜 License
MIT
