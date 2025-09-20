import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AdminDashboard from './components/AdminDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import ProfileModal from './components/modals/ProfileModal';
import AssessmentModal from './components/modals/AssessmentModal';
import QuizModal from './components/modals/QuizModal';
import LessonModal from './components/LessonModal';
import TopicSelectionModal from './components/TopicSelectionModal';
import QuestionInterface from './components/QuestionInterface';
import { ThemeProvider } from './contexts/ThemeContext';
import { appData } from './data/appData';
import { supabase } from './services/supabaseClient';
import './components/TopicSelectionModal.css';
import './components/QuestionInterface.css';
import './index.css';

// Context for global state management
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTopicSelectionModal, setShowTopicSelectionModal] = useState(false);
  const [showQuestionInterface, setShowQuestionInterface] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigate = useNavigate();

  // Initialize app - check for existing user session
  useEffect(() => {
    if (hasNavigated) return; // Prevent multiple navigations
    
    // Check for Supabase session (Google OAuth)
    const checkSupabaseSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !currentUser) {
        const supabaseUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          role: 'student', // Default role, can be updated based on email domain or other logic
          totalPoints: 0,
          badges: [],
          progress: {},
          currentStreak: 0,
          weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
          level: 'basic',
          assessmentScore: 0,
          sessionStats: {
            totalQuestions: 0,
            correctAnswers: 0,
            totalPoints: 0,
            averageTime: 0
          }
        };
        
        setCurrentUser(supabaseUser);
        localStorage.setItem('smartTutorUser', JSON.stringify(supabaseUser));
        setHasNavigated(true);
        
        // Redirect based on role
        if (supabaseUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setShowTopicSelectionModal(true);
        }
        return;
      }
    };
    
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('smartTutorUser');
    if (savedUser && !currentUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        
        // Only navigate if we're currently on the landing page or login page
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/login' || currentPath === '/signup' || currentPath === '/dashboard') {
          setHasNavigated(true);
          if (user.role === 'student') {
            navigate('/student', { replace: true });
          } else if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/student', { replace: true });
          }
        }
      } catch (e) {
        localStorage.removeItem('smartTutorUser');
        navigate('/');
      }
    } else if (!savedUser) {
      // No localStorage session, check Supabase
      checkSupabaseSession();
    }
  }, [navigate, currentUser, hasNavigated]);

  const handleRoleSelection = (role) => {
    setCurrentUser({ role });
    setShowProfileModal(true);
  };

  const handleProfileSetup = (profileData) => {
    const updatedUser = { ...currentUser, ...profileData };
    
    if (updatedUser.role === 'student') {
      // Initialize student data
      updatedUser.totalPoints = 120;
      updatedUser.badges = [1];
      updatedUser.progress = {};
      updatedUser.currentStreak = 3;
      updatedUser.weeklyActivity = [2, 3, 1, 4, 2, 3, 2];
      
      // Initialize progress for all subjects
      appData.subjects.forEach(subject => {
        updatedUser.progress[subject.name] = Math.floor(Math.random() * 40) + 10;
      });
    }
    
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
    setShowProfileModal(false);
    
    if (updatedUser.role === 'student') {
      startDiagnosticAssessment();
    } // else {
      // navigate('/teacher'); // Teacher feature temporarily disabled
    // }
  };

  const startDiagnosticAssessment = () => {
    const assessment = {
      questions: [...appData.diagnosticQuestions],
      currentQuestionIndex: 0,
      answers: [],
      score: 0
    };
    setCurrentAssessment(assessment);
    setShowAssessmentModal(true);
  };

  const completeAssessment = (score, percentage) => {
    // Determine skill level based on MCQ performance
    let level = 'Beginner';
    let levelDescription = '';
    
    if (percentage >= 85) {
      level = 'Advanced';
      levelDescription = 'Excellent! You have strong programming fundamentals.';
    } else if (percentage >= 65) {
      level = 'Intermediate';
      levelDescription = 'Good job! You have solid basic knowledge.';
    } else if (percentage >= 40) {
      level = 'Beginner';
      levelDescription = 'Great start! We\'ll help you build strong foundations.';
    } else {
      level = 'Beginner';
      levelDescription = 'No worries! Everyone starts somewhere. Let\'s learn together.';
    }
    
    const updatedUser = {
      ...currentUser,
      level,
      levelDescription,
      assessmentScore: percentage,
      assessmentCompleted: true,
      skillLevel: level // Additional field for clarity
    };
    
    // Set initial progress based on determined level
    appData.subjects.forEach(subject => {
      let initialProgress = 0;
      if (level === 'Advanced') {
        initialProgress = Math.floor(Math.random() * 20) + 60; // 60-80%
      } else if (level === 'Intermediate') {
        initialProgress = Math.floor(Math.random() * 20) + 30; // 30-50%
      } else {
        initialProgress = Math.floor(Math.random() * 15) + 5; // 5-20%
      }
      updatedUser.progress[subject.name] = initialProgress;
    });
    
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
  };

  const startLearning = () => {
    setShowAssessmentModal(false);
    navigate('/student');
  };

  const handleLogin = (userData) => {
    const user = {
      ...userData,
      totalPoints: 0,
      badges: [],
      progress: {},
      currentStreak: 0,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      level: 'basic',
      assessmentScore: 0,
      sessionStats: {
        totalQuestions: 0,
        correctAnswers: 0,
        totalPoints: 0,
        averageTime: 0
      }
    };
    
    setCurrentUser(user);
    localStorage.setItem('smartTutorUser', JSON.stringify(user));
    
    // Show topic selection modal instead of navigating directly
    setShowTopicSelectionModal(true);
  };

  const handleLogout = async () => {
    // Sign out from Supabase if user is logged in via OAuth
    await supabase.auth.signOut();
    
    localStorage.removeItem('smartTutorUser');
    setCurrentUser(null);
    setHasNavigated(false);
    navigate('/');
  };

  const handleProfileComplete = (profileData) => {
    const updatedUser = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
    setShowProfileModal(false);
  };

  const handleQuizComplete = (score, answers) => {
    const updatedUser = {
      ...currentUser,
      totalPoints: (currentUser.totalPoints || 0) + score,
      weeklyActivity: [...(currentUser.weeklyActivity || []), 1]
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
    setShowQuizModal(false);
    setCurrentQuiz(null);
  };

  // Handle topic selection completion
  const handleTopicSelectionComplete = (preferences) => {
    setUserPreferences(preferences);
    const updatedUser = {
      ...currentUser,
      preferences
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
    setShowTopicSelectionModal(false);
    setShowQuestionInterface(true);
    setHasNavigated(true);
    navigate('/questions', { replace: true });
  };

  // Handle answer submission and progress tracking
  const handleAnswerSubmit = (answerData) => {
    const updatedUser = {
      ...currentUser,
      totalPoints: answerData.sessionStats.totalPoints,
      level: answerData.newLevel || currentUser.level,
      sessionStats: answerData.sessionStats
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
  };

  // Handle level updates
  const handleLevelUpdate = (newLevel) => {
    const updatedUser = {
      ...currentUser,
      level: newLevel
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('smartTutorUser', JSON.stringify(updatedUser));
  };

  const contextValue = {
    currentUser,
    setCurrentUser,
    appData,
    handleRoleSelection,
    handleProfileSetup,
    startDiagnosticAssessment,
    completeAssessment,
    startLearning,
    handleLogin,
    handleLogout,
    showQuizModal,
    setShowQuizModal,
    currentQuiz,
    setCurrentQuiz,
    showLessonModal,
    setShowLessonModal,
    currentLesson,
    setCurrentLesson,
    userPreferences,
    handleAnswerSubmit,
    handleLevelUpdate
  };

  return (
    <ThemeProvider>
      <AppContext.Provider value={contextValue}>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignUpPage onSignUp={handleLogin} />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/questions" element={
              showQuestionInterface ? (
                <QuestionInterface 
                  userPreferences={userPreferences}
                  onAnswerSubmit={handleAnswerSubmit}
                  onLevelUpdate={handleLevelUpdate}
                  currentUser={currentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } />
          </Routes>

          {showProfileModal && (
            <ProfileModal 
              onClose={() => setShowProfileModal(false)} 
              onComplete={handleProfileComplete}
              currentUser={currentUser}
            />
          )}

          {showAssessmentModal && currentAssessment && (
            <AssessmentModal 
              assessment={currentAssessment}
              setAssessment={setCurrentAssessment}
              onComplete={completeAssessment}
              onClose={() => setShowAssessmentModal(false)}
            />
          )}

          {showQuizModal && currentQuiz && (
            <QuizModal 
              quiz={currentQuiz}
              onComplete={handleQuizComplete}
              onClose={() => setShowQuizModal(false)}
            />
          )}
          
          {showLessonModal && currentLesson && (
            <LessonModal 
              lesson={currentLesson.lesson}
              subject={currentLesson.subject}
              onClose={() => setShowLessonModal(false)}
            />
          )}

          {showTopicSelectionModal && (
            <TopicSelectionModal 
              isOpen={showTopicSelectionModal}
              onClose={() => {
                setShowTopicSelectionModal(false);
                handleLogout(); // Logout if user cancels topic selection
              }}
              onComplete={handleTopicSelectionComplete}
              userEmail={currentUser?.email}
            />
          )}
        </div>
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;
