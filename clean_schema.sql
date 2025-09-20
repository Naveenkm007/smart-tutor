-- Smart Tutor Dashboard - Clean Schema (handles existing objects)
-- Run this in your Supabase SQL Editor

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing view if it exists
DROP VIEW IF EXISTS admin_dashboard_stats;

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
  total_time_spent INTEGER DEFAULT 0,
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
  duration INTEGER DEFAULT 30,
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
  time_spent INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
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

-- Insert sample subjects (only if they don't exist)
INSERT INTO subjects (name, icon, description, difficulty) 
SELECT 'Mathematics', '🔢', 'Learn fundamental and advanced mathematical concepts', 'intermediate'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Mathematics');

INSERT INTO subjects (name, icon, description, difficulty) 
SELECT 'Science', '🧪', 'Explore the wonders of physics, chemistry, and biology', 'beginner'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Science');

INSERT INTO subjects (name, icon, description, difficulty) 
SELECT 'English', '📚', 'Master language skills, literature, and writing', 'advanced'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'English');

INSERT INTO subjects (name, icon, description, difficulty) 
SELECT 'History', '🏛️', 'Discover past civilizations and historical events', 'intermediate'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'History');

INSERT INTO subjects (name, icon, description, difficulty) 
SELECT 'Computer Science', '💻', 'Learn programming and computational thinking', 'advanced'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Computer Science');

-- Insert sample users (only if they don't exist)
INSERT INTO users (email, name, role, status, grade, class, school, performance_score) 
SELECT 'admin@smarttutor.com', 'Admin User', 'admin', 'active', NULL, NULL, 'Smart Tutor Academy', 100
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@smarttutor.com');

INSERT INTO users (email, name, role, status, grade, class, school, performance_score) 
SELECT 'teacher@smarttutor.com', 'Sarah Johnson', 'teacher', 'active', NULL, NULL, 'Smart Tutor Academy', 95
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'teacher@smarttutor.com');

INSERT INTO users (email, name, role, status, grade, class, school, performance_score) 
SELECT 'john.student@example.com', 'John Smith', 'student', 'active', '10', 'A', 'Demo High School', 85
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.student@example.com');

INSERT INTO users (email, name, role, status, grade, class, school, performance_score) 
SELECT 'jane.student@example.com', 'Jane Doe', 'student', 'active', '11', 'B', 'Demo High School', 92
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.student@example.com');

INSERT INTO users (email, name, role, status, grade, class, school, performance_score) 
SELECT 'mike.student@example.com', 'Mike Wilson', 'student', 'active', '9', 'A', 'Demo High School', 78
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mike.student@example.com');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Create the admin dashboard view
CREATE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM users WHERE role = 'teacher') as active_teachers,
  (SELECT COUNT(*) FROM subjects WHERE is_active = true) as total_courses,
  (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
  (SELECT AVG(performance_score) FROM users WHERE role = 'student') as avg_student_performance,
  (SELECT COUNT(*) FROM user_progress WHERE completed = true) as total_completions,
  (SELECT SUM(total_time_spent) FROM users) as total_learning_time;
  