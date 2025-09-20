# 🚀 Supabase Setup Guide for Smart Tutor Admin Panel

This guide will help you connect your admin panel to a real Supabase database instead of using mock data.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Node.js and npm installed
- The Smart Tutor project running locally

## 🔧 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `smart-tutor-dashboard`
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest to your location
6. Click "Create new project"

### 2. Get Your Project Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGci...`)

### 3. Configure Environment Variables

1. In your project root directory, create a `.env` file:
   ```bash
   # Copy from .env.example
   cp .env.example .env
   ```

2. Edit the `.env` file with your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   REACT_APP_ENV=development
   ```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database_schema.sql` from your project
3. Paste it into the SQL Editor and click **Run**
4. This will create all necessary tables, indexes, and sample data

### 5. Enable Row Level Security (Optional but Recommended)

The schema automatically enables RLS and creates policies. If you need to modify them:

1. Go to **Authentication** → **Policies**
2. Review and adjust the policies as needed for your use case

### 6. Restart Your Development Server

```bash
npm start
```

Your admin panel will now connect to the real Supabase database!

## 📊 Database Tables Created

The setup creates the following tables:

| Table | Purpose |
|-------|---------|
| `users` | Store user information (students, teachers, admins) |
| `subjects` | Course subjects (Math, Science, etc.) |
| `lessons` | Individual lessons within subjects |
| `user_progress` | Track user progress through lessons |
| `lesson_progress` | Detailed lesson completion tracking |
| `analytics_events` | User behavior and interaction tracking |
| `system_health` | System monitoring metrics |

## 🔐 Authentication Setup (Optional)

To enable user authentication:

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers
3. Set up email templates
4. Configure redirect URLs

## 📈 Sample Data

The schema includes sample data:
- 5 sample users (1 admin, 1 teacher, 3 students)
- 5 sample subjects
- Various progress records

## 🛠️ Troubleshooting

### Issue: "Failed to load dashboard data"
**Solution**: Check your environment variables and ensure Supabase URL and key are correct.

### Issue: "Database connection error"
**Solution**: Verify your Supabase project is active and not paused (free tier auto-pauses after 1 week of inactivity).

### Issue: "Permission denied"
**Solution**: Check Row Level Security policies in Supabase dashboard.

### Issue: "Tables not found"
**Solution**: Ensure you've run the database schema SQL in the Supabase SQL Editor.

## 🔄 Demo Mode vs Production Mode

The application automatically detects the mode:

- **Demo Mode**: When no Supabase credentials are provided (uses mock data)
- **Production Mode**: When valid Supabase credentials are configured

## 📝 Customization

### Adding More Sample Data

You can add more sample data by running additional SQL commands in the Supabase SQL Editor:

```sql
-- Add more students
INSERT INTO users (email, name, role, grade, class, school, performance_score) VALUES
  ('student3@example.com', 'Alice Brown', 'student', '10', 'A', 'Demo High School', 90),
  ('student4@example.com', 'Bob Green', 'student', '11', 'B', 'Demo High School', 87);

-- Add more subjects
INSERT INTO subjects (name, icon, description, difficulty) VALUES
  ('Art', '🎨', 'Creative arts and design', 'beginner'),
  ('Music', '🎵', 'Music theory and practice', 'intermediate');
```

### Modifying Dashboard Statistics

The admin dashboard uses a view called `admin_dashboard_stats`. You can modify this view to include additional statistics:

```sql
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM users WHERE role = 'teacher') as active_teachers,
  (SELECT COUNT(*) FROM subjects WHERE is_active = true) as total_courses,
  -- Add your custom statistics here
  (SELECT COUNT(*) FROM lessons) as total_lessons;
```

## 🚀 Next Steps

1. **Set up monitoring**: Use Supabase's built-in monitoring tools
2. **Configure backups**: Set up automated database backups
3. **Add more analytics**: Implement detailed user behavior tracking
4. **Set up staging environment**: Create a separate Supabase project for testing

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase project status
3. Review the troubleshooting section above
4. Check Supabase logs in the dashboard

---

**🎉 Congratulations!** Your Smart Tutor Admin Panel is now connected to a real database!