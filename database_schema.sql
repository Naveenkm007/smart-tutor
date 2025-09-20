-- Smart Tutor Dashboard - Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  grade VARCHAR(10),
  class VARCHAR(10),
  phone VARCHAR(20),
  school VARCHAR(255),
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  performance_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  difficulty VARCHAR(50) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  duration INTEGER DEFAULT 30, -- in minutes
  order_index INTEGER DEFAULT 1,
  difficulty VARCHAR(50) DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0, -- in minutes
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Lesson Progress table (for detailed tracking)
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_properties JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Health table
CREATE TABLE IF NOT EXISTS system_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit VARCHAR(50),
  status VARCHAR(50) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO subjects (name, icon, description, difficulty) VALUES
  ('Mathematics', '🔢', 'Learn fundamental and advanced mathematical concepts', 'intermediate'),
  ('Science', '🧪', 'Explore the wonders of physics, chemistry, and biology', 'beginner'),
  ('English', '📚', 'Master language skills, literature, and writing', 'advanced'),
  ('History', '🏛️', 'Discover past civilizations and historical events', 'intermediate'),
  ('Computer Science', '💻', 'Learn programming and computational thinking', 'advanced')
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO users (email, name, role, status, grade, class, school, performance_score) VALUES
  ('admin@smarttutor.com', 'Admin User', 'admin', 'active', NULL, NULL, 'Smart Tutor Academy', 100),
  ('teacher@smarttutor.com', 'Sarah Johnson', 'teacher', 'active', NULL, NULL, 'Smart Tutor Academy', 95),
  ('john.student@example.com', 'John Smith', 'student', 'active', '10', 'A', 'Demo High School', 85),
  ('jane.student@example.com', 'Jane Doe', 'student', 'active', '11', 'B', 'Demo High School', 92),
  ('mike.student@example.com', 'Mike Wilson', 'student', 'active', '9', 'A', 'Demo High School', 78)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_subject_id ON user_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data, admins can read all
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Subjects are readable by all authenticated users
CREATE POLICY "Subjects readable by authenticated users" ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Lessons are readable by all authenticated users
CREATE POLICY "Lessons readable by authenticated users" ON lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Users can manage their own lesson progress
CREATE POLICY "Users can manage own lesson progress" ON lesson_progress FOR ALL USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Analytics events - users can insert their own, admins can read all
CREATE POLICY "Users can insert own analytics" ON analytics_events FOR INSERT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can read analytics" ON analytics_events FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- System health - only admins can access
CREATE POLICY "Admins can manage system health" ON system_health FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM users WHERE role = 'teacher') as active_teachers,
  (SELECT COUNT(*) FROM subjects WHERE is_active = true) as total_courses,
  (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
  (SELECT AVG(performance_score) FROM users WHERE role = 'student') as avg_student_performance,
  (SELECT COUNT(*) FROM user_progress WHERE completed = true) as total_completions,
  (SELECT SUM(total_time_spent) FROM users) as total_learning_time;

-- Grant necessary permissions
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;