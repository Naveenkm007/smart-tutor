import { createClient } from '@supabase/supabase-js';

// Configuration constants
const CONFIG = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://demo-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-key',
  DEMO_MODE: !process.env.REACT_APP_SUPABASE_URL
};

// Demo data constants
const DEMO_DATA = {
  SUBJECTS: [
    { id: 1, name: 'Mathematics', icon: '🔢', modules: 12, difficulty: 'Intermediate' },
    { id: 2, name: 'Science', icon: '🧪', modules: 10, difficulty: 'Beginner' },
    { id: 3, name: 'English', icon: '📚', modules: 8, difficulty: 'Advanced' },
    { id: 4, name: 'History', icon: '🏛️', modules: 6, difficulty: 'Intermediate' }
  ],
  USER_PROGRESS: {
    'Mathematics': 65,
    'Science': 40,
    'English': 80,
    'History': 25
  },
  LESSONS: [
    { id: 1, title: 'Introduction & Basics', status: 'completed', duration: 20 },
    { id: 2, title: 'Core Concepts', status: 'completed', duration: 25 },
    { id: 3, title: 'Practice Problems', status: 'in-progress', duration: 30 },
    { id: 4, title: 'Advanced Topics', status: 'locked', duration: 35 },
    { id: 5, title: 'Final Assessment', status: 'locked', duration: 40 }
  ],
  USERS: [
    {
      id: 'demo-user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      grade: '10',
      class: 'A',
      phone: '9876543210',
      school: 'Demo High School',
      status: 'active',
      last_login: new Date().toISOString(),
      login_count: 5,
      total_lessons_completed: 12,
      total_time_spent: 240,
      performance_score: 85,
      created_at: new Date().toISOString()
    }
  ],
  AUTH_USERS: {
    'admin@smarttutor.com': { id: 'admin', role: 'admin', name: 'Admin User' },
    'teacher@smarttutor.com': { id: 'teacher', role: 'teacher', name: 'Sarah Johnson' },
    'student@smarttutor.com': { id: 'student', role: 'student', name: 'John Student' }
  }
};

// Supabase client instance
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Demo mode check
export const isDemo = CONFIG.DEMO_MODE;

// Error handling utility
const handleSupabaseError = (operation, error) => {
  console.error(`Supabase ${operation} error:`, error);
  return { data: null, error };
};

// Success logging utility
const logSuccess = (operation, data) => {
  console.log(`${operation} successful:`, data);
  return data;
};

/**
 * Learning Service - Handles all learning-related operations
 * Provides both real Supabase and demo mode functionality
 */
export class LearningService {
  /**
   * Get all subjects
   * @returns {Promise<{data: Array, error: any}>}
   */
  static async getSubjects() {
    if (CONFIG.DEMO_MODE) {
      return { data: DEMO_DATA.SUBJECTS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) return handleSupabaseError('getSubjects', error);
      return { data: logSuccess('getSubjects', data), error: null };
    } catch (error) {
      return handleSupabaseError('getSubjects', error);
    }
  }

  /**
   * Get user progress for all subjects
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object, error: any}>}
   */
  static async getUserProgress(userId) {
    if (CONFIG.DEMO_MODE) {
      return { data: DEMO_DATA.USER_PROGRESS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('subject_name, progress_percentage')
        .eq('user_id', userId);

      if (error) return handleSupabaseError('getUserProgress', error);

      const progressMap = {};
      data?.forEach(item => {
        progressMap[item.subject_name] = item.progress_percentage;
      });

      return { data: logSuccess('getUserProgress', progressMap), error: null };
    } catch (error) {
      return handleSupabaseError('getUserProgress', error);
    }
  }

  /**
   * Get lessons for a specific subject
   * @param {string|number} subjectId - Subject ID
   * @returns {Promise<{data: Array, error: any}>}
   */
  static async getLessons(subjectId) {
    if (CONFIG.DEMO_MODE) {
      return { data: DEMO_DATA.LESSONS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

      if (error) return handleSupabaseError('getLessons', error);
      return { data: logSuccess('getLessons', data), error: null };
    } catch (error) {
      return handleSupabaseError('getLessons', error);
    }
  }

  /**
   * Update lesson progress for a user
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {string} status - Progress status
   * @returns {Promise<{data: any, error: any}>}
   */
  static async updateLessonProgress(userId, lessonId, status) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Updated lesson progress', { userId, lessonId, status });
      return { data: true, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          status,
          updated_at: new Date().toISOString()
        });

      if (error) return handleSupabaseError('updateLessonProgress', error);
      return { data: logSuccess('updateLessonProgress', data), error: null };
    } catch (error) {
      return handleSupabaseError('updateLessonProgress', error);
    }
  }

  /**
   * Update user progress for a lesson
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {number} progress - Progress percentage
   * @returns {Promise<any>}
   */
  static async updateUserProgress(userId, lessonId, progress) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Updated user progress', { userId, lessonId, progress });
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          progress_percentage: progress,
          completed: progress >= 100,
          completed_at: progress >= 100 ? new Date().toISOString() : null
        });

      if (error) throw error;
      return logSuccess('updateUserProgress', data);
    } catch (error) {
      console.error('Failed to update user progress:', error);
      throw error;
    }
  }

  /**
   * Admin function: Get all users
   * @returns {Promise<Array>}
   */
  static async getAllUsers() {
    if (CONFIG.DEMO_MODE) {
      return DEMO_DATA.USERS;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase getAllUsers error:', error);
        throw error;
      }
      
      return logSuccess('getAllUsers', data || []);
    } catch (error) {
      console.error('Failed to fetch users from Supabase:', error);
      throw error;
    }
  }

  /**
   * Admin function: Get all lessons with subject information
   * @returns {Promise<Array>}
   */
  static async getAllLessons() {
    if (CONFIG.DEMO_MODE) {
      return DEMO_DATA.LESSONS;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return logSuccess('getAllLessons', data);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      throw error;
    }
  }

  /**
   * Admin function: Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<any>}
   */
  static async updateUserRole(userId, role) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Updated user role', { userId, role });
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      return logSuccess('updateUserRole', data);
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  }

  /**
   * Admin function: Delete user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async deleteUser(userId) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Deleted user', { userId });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      console.log('User deleted successfully:', userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Admin function: Create new subject
   * @param {Object} subject - Subject data
   * @returns {Promise<any>}
   */
  static async createSubject(subject) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Created subject', subject);
      return { ...subject, id: `demo-${Date.now()}` };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject);
      
      if (error) throw error;
      return logSuccess('createSubject', data);
    } catch (error) {
      console.error('Failed to create subject:', error);
      throw error;
    }
  }

  /**
   * Admin function: Update subject
   * @param {string} id - Subject ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<any>}
   */
  static async updateSubject(id, updates) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Updated subject', { id, updates });
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return logSuccess('updateSubject', data);
    } catch (error) {
      console.error('Failed to update subject:', error);
      throw error;
    }
  }

  /**
   * Admin function: Delete subject
   * @param {string} id - Subject ID
   * @returns {Promise<void>}
   */
  static async deleteSubject(id) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Deleted subject', { id });
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log('Subject deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete subject:', error);
      throw error;
    }
  }

  /**
   * Get user by email address
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  static async getUserByEmail(email) {
    if (CONFIG.DEMO_MODE) {
      return null; // No existing users in demo mode
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('getUserByEmail error:', error);
        throw error;
      }
      
      return data ? logSuccess('getUserByEmail', data) : null;
    } catch (error) {
      console.error('Failed to get user by email:', error);
      return null;
    }
  }

  /**
   * Create new user in database
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  static async createUser(userData) {
    if (CONFIG.DEMO_MODE) {
      const user = { id: `demo-${Date.now()}`, ...userData };
      return user;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) {
        console.error('createUser error:', error);
        throw error;
      }
      
      return logSuccess('createUser', data);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp and increment login count
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async updateUserLastLogin(userId) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Updated user last login', { userId });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          login_count: supabase.raw('login_count + 1')
        })
        .eq('id', userId);
      
      if (error) {
        console.error('updateUserLastLogin error:', error);
      } else {
        console.log('Updated user last login successfully:', userId);
      }
    } catch (error) {
      console.error('Failed to update user last login:', error);
    }
  }

  /**
   * User Authentication: Sign up new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<{data: any, error: any}>}
   */
  static async signUp(email, password, userData) {
    if (CONFIG.DEMO_MODE) {
      const user = { id: `demo-${Date.now()}`, email, ...userData };
      localStorage.setItem('supabase-demo-user', JSON.stringify(user));
      return { data: { user }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) return handleSupabaseError('signUp', error);
      return { data: logSuccess('signUp', data), error: null };
    } catch (error) {
      return handleSupabaseError('signUp', error);
    }
  }

  /**
   * User Authentication: Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{data: any, error: any}>}
   */
  static async signIn(email, password) {
    if (CONFIG.DEMO_MODE) {
      const demoUser = DEMO_DATA.AUTH_USERS[email];
      
      if (demoUser && password.length >= 6) {
        const user = { ...demoUser, email };
        localStorage.setItem('supabase-demo-user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      
      return { data: null, error: { message: 'Invalid credentials' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) return handleSupabaseError('signIn', error);
      return { data: logSuccess('signIn', data), error: null };
    } catch (error) {
      return handleSupabaseError('signIn', error);
    }
  }

  /**
   * User Authentication: Sign out user
   * @returns {Promise<{error: any}>}
   */
  static async signOut() {
    if (CONFIG.DEMO_MODE) {
      localStorage.removeItem('supabase-demo-user');
      console.log('Demo: User signed out');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };
      
      console.log('User signed out successfully');
      return { error: null };
    } catch (error) {
      console.error('Failed to sign out:', error);
      return { error };
    }
  }

  /**
   * User Authentication: Get current authenticated user
   * @returns {Promise<{data: any, error: any}>}
   */
  static async getCurrentUser() {
    if (CONFIG.DEMO_MODE) {
      const user = localStorage.getItem('supabase-demo-user');
      return { data: { user: user ? JSON.parse(user) : null }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return handleSupabaseError('getCurrentUser', error);
      
      return { data: logSuccess('getCurrentUser', data), error: null };
    } catch (error) {
      return handleSupabaseError('getCurrentUser', error);
    }
  }
}

/**
 * Analytics Service - Handles analytics and reporting operations
 */
export class AnalyticsService {
  /**
   * Track user events
   * @param {string} event - Event name
   * @param {Object} properties - Event properties
   */
  static trackEvent(event, properties = {}) {
    if (CONFIG.DEMO_MODE) {
      console.log('Demo: Analytics event tracked:', { event, properties });
      return;
    }

    // In production, integrate with analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Analytics event:', { event, properties, timestamp: new Date().toISOString() });
  }

  /**
   * Track user engagement
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional metadata
   */
  static trackUserEngagement(action, metadata = {}) {
    this.trackEvent('user_engagement', { action, ...metadata });
  }

  /**
   * Get learning analytics for a user
   * @param {string} userId - User ID
   * @returns {Object} Analytics data
   */
  static getLearningAnalytics(userId) {
    if (CONFIG.DEMO_MODE) {
      return {
        totalTimeSpent: 120,
        lessonsCompleted: 8,
        averageScore: 85,
        streakDays: 5,
        weeklyProgress: [20, 35, 40, 55, 60, 75, 85]
      };
    }

    // In production, fetch real analytics from database
    return {
      totalTimeSpent: 0,
      lessonsCompleted: 0,
      averageScore: 0,
      streakDays: 0,
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
    };
  }
}

/**
 * User Behavior Tracker - Tracks user interactions for UX improvements
 */
export class UserBehaviorTracker {
  /**
   * Track page views
   * @param {string} page - Page name
   */
  static trackPageView(page) {
    AnalyticsService.trackEvent('page_view', { page });
  }

  /**
   * Track button clicks
   * @param {string} button - Button identifier
   * @param {Object} context - Additional context
   */
  static trackButtonClick(button, context = {}) {
    AnalyticsService.trackEvent('button_click', { button, ...context });
  }

  /**
   * Track form submissions
   * @param {string} form - Form identifier
   * @param {Object} data - Form data (sanitized)
   */
  static trackFormSubmission(form, data = {}) {
    AnalyticsService.trackEvent('form_submission', { form, ...data });
  }

  /**
   * Track errors
   * @param {string} error - Error message
   * @param {Object} context - Error context
   */
  static trackError(error, context = {}) {
    AnalyticsService.trackEvent('error', { error, ...context });
  }
}

export default LearningService;
