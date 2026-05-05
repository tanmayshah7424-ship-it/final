# Admin Dashboard Setup Guide

## 🚀 Quick Start

Your admin dashboard has been enhanced with a modern, feature-rich interface! Follow these steps to grant admin privileges and start using it.

## Step 1: Grant Admin Privileges

You need to run the SQL migration to grant admin role to `tanmayshah7424@gmail.com`.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/20260212000000_grant_admin_role.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Check the output - you should see: `Admin role granted successfully to tanmayshah7424@gmail.com`

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd c:\Users\91782\scorehub-live

# Apply the migration
supabase db push
```

### Option C: Manual SQL Execution

If the user account doesn't exist yet, first register at `/register`, then run this SQL:

```sql
-- Find and grant admin role
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'tanmayshah7424@gmail.com';

  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
```

## Step 2: Test Admin Access

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Login with admin credentials**:
   - Navigate to `http://localhost:5173/login`
   - Email: `tanmayshah7424@gmail.com`
   - Password: `Tanmay7424@`

3. **Verify admin access**:
   - After login, you should see an "Admin" link in the header
   - Click it to access the admin dashboard at `/admin`

## 📊 Admin Dashboard Features

### Dashboard Overview (`/admin`)
- **Statistics Cards**: View total users, matches, live matches, and teams
- **Recent Activity**: See the latest platform activities
- **Quick Actions**: Fast navigation to management pages
- **Platform Overview**: Key metrics with visual progress bars

### Management Pages

#### Teams (`/admin/teams`)
- Add new teams with name, short name, and logo
- View all teams in a clean list
- Delete teams (cascades to players)

#### Players (`/admin/players`)
- Add players with team assignment
- Set position and jersey number
- View all players grouped by team

#### Matches (`/admin/matches`)
- Schedule new matches
- Start/stop live matches
- Update scores in real-time
- View match history

#### Users (`/admin/users`)
- View all registered users
- Grant/revoke admin privileges
- See user roles and details

## 🎨 UI Enhancements

The admin dashboard now features:
- ✨ Modern glassmorphism design
- 🎯 Color-coded stat cards with icons
- 📱 Fully responsive layout
- 🔄 Real-time activity feed
- 📊 Visual progress indicators
- 🎭 Smooth animations and transitions
- 👤 Admin profile section in sidebar

## 🔒 Security Features

- **Role-Based Access Control**: Only users with admin role can access admin pages
- **Row Level Security**: Database policies enforce admin-only operations
- **Protected Routes**: React Router guards prevent unauthorized access
- **Session Management**: Automatic role checking on auth state changes

## 🐛 Troubleshooting

### "Admin" link not appearing after login?

1. **Check if admin role was granted**:
   - Use the "Debug: Check My Admin Status" button on the login page
   - Or run this SQL query:
     ```sql
     SELECT * FROM user_roles WHERE user_id = (
       SELECT id FROM auth.users WHERE email = 'tanmayshah7424@gmail.com'
     );
     ```

2. **Clear browser cache and reload**:
   - Press `Ctrl+Shift+R` to hard reload
   - Or clear cookies and login again

3. **Check browser console for errors**:
   - Press `F12` to open DevTools
   - Look for any authentication errors

### Can't access admin pages?

- Ensure you're logged in with the correct account
- Verify the admin role exists in the database
- Check that RLS policies are enabled

### Database connection issues?

- Verify your `.env` file has correct Supabase credentials
- Check Supabase project status
- Ensure your IP is allowed in Supabase settings

## 📝 Next Steps

1. **Add Sample Data**: Create some teams, players, and matches to test the system
2. **Customize Branding**: Update colors and logos in `tailwind.config.ts`
3. **Add More Features**: Consider adding:
   - Match statistics and analytics
   - Player performance tracking
   - Team standings/leaderboards
   - Email notifications
   - File upload for team logos

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Review the Supabase logs
3. Verify all migrations have been applied
4. Ensure environment variables are set correctly

---

**Congratulations!** 🎉 Your admin dashboard is ready to use. Enjoy managing your ScoreHub platform!
