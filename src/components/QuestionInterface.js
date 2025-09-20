import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionGenerationService from '../services/questionGenerationService';

const QuestionInterface = ({ 
  userPreferences, 
  onAnswerSubmit, 
  onLevelUpdate,
  currentUser 
}) => {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(userPreferences?.level || 'basic');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    averageTime: 0
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const navigate = useNavigate();
  const questionService = new QuestionGenerationService();
  
  // Session completion threshold
  const SESSION_COMPLETION_THRESHOLD = 10; // Complete session after 10 questions

  const generateNewQuestion = useCallback(async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setEvaluation(null);
    
    try {
      const newQuestion = await questionService.generateQuestion(
        userPreferences.topic,
        currentLevel
      );
      setQuestion(newQuestion);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to generate question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userPreferences.topic, currentLevel]);

  useEffect(() => {
    if (userPreferences?.topic) {
      generateNewQuestion();
    }
  }, [generateNewQuestion, userPreferences]);

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null || !question || !startTime) return;

    const timeSpent = Date.now() - startTime;
    const result = questionService.evaluateAnswer(question, selectedAnswer, timeSpent);
    
    setEvaluation(result);
    setShowResult(true);

    // Update session stats
    const newStats = {
      totalQuestions: sessionStats.totalQuestions + 1,
      correctAnswers: sessionStats.correctAnswers + (result.isCorrect ? 1 : 0),
      totalPoints: sessionStats.totalPoints + result.earnedPoints,
      averageTime: ((sessionStats.averageTime * sessionStats.totalQuestions) + timeSpent) / (sessionStats.totalQuestions + 1)
    };
    setSessionStats(newStats);

    // Check if session should be completed
    if (newStats.totalQuestions >= SESSION_COMPLETION_THRESHOLD) {
      setShowCompletionModal(true);
    }

    // Update consecutive correct counter
    if (result.isCorrect) {
      setConsecutiveCorrect(prev => prev + 1);
    } else {
      setConsecutiveCorrect(0);
    }

    // Calculate current accuracy
    const accuracy = (newStats.correctAnswers / newStats.totalQuestions) * 100;

    // Check for level updates
    const newLevel = questionService.updateProficiencyLevel(
      currentLevel, 
      accuracy, 
      result.isCorrect ? consecutiveCorrect + 1 : 0
    );

    if (newLevel !== currentLevel) {
      setCurrentLevel(newLevel);
      onLevelUpdate?.(newLevel);
    }

    // Report progress to parent component
    onAnswerSubmit?.({
      questionId: question.id,
      userAnswer: selectedAnswer,
      evaluation: result,
      sessionStats: newStats,
      levelUpdated: newLevel !== currentLevel,
      newLevel
    });
  };

  const skipQuestion = () => {
    if (!question) return;

    // Treat as unanswered (wrong answer)
    const result = questionService.evaluateAnswer(question, -1, Date.now() - startTime);
    
    setEvaluation(result);
    setShowResult(true);
    setConsecutiveCorrect(0);

    // Update stats for skipped question
    const newStats = {
      ...sessionStats,
      totalQuestions: sessionStats.totalQuestions + 1
    };
    setSessionStats(newStats);

    // Check for level downgrade
    const accuracy = (newStats.correctAnswers / newStats.totalQuestions) * 100;
    const newLevel = questionService.updateProficiencyLevel(currentLevel, accuracy, 0);
    
    if (newLevel !== currentLevel) {
      setCurrentLevel(newLevel);
      onLevelUpdate?.(newLevel);
    }

    onAnswerSubmit?.({
      questionId: question.id,
      userAnswer: null,
      evaluation: result,
      sessionStats: newStats,
      levelUpdated: newLevel !== currentLevel,
      newLevel,
      skipped: true
    });
  };

  const handleBackToDashboard = () => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const handleSessionComplete = () => {
    setShowCompletionModal(false);
    handleBackToDashboard();
  };

  const continueSession = () => {
    setShowCompletionModal(false);
    generateNewQuestion();
  };

  if (isLoading) {
    return (
      <div className="question-interface loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Generating your next question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-interface error">
        <p>Unable to load question. Please try again.</p>
        <button onClick={generateNewQuestion} className="btn-primary">
          Generate Question
        </button>
      </div>
    );
  }

  return (
    <div className="question-interface">
      {/* Header with stats and navigation */}
      <div className="question-header">
        <button 
          onClick={handleBackToDashboard}
          className="btn-back"
          title="Back to Dashboard"
        >
          ← Dashboard
        </button>
        <div className="session-stats">
          <div className="stat">
            <span className="stat-label">Questions:</span>
            <span className="stat-value">{sessionStats.totalQuestions}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Correct:</span>
            <span className="stat-value">{sessionStats.correctAnswers}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Points:</span>
            <span className="stat-value">{sessionStats.totalPoints}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Level:</span>
            <span className={`stat-value level-${currentLevel}`}>{currentLevel.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="question-content">
        <div className="question-meta">
          <span className="topic-badge">{question.topic}</span>
          <span className="difficulty-badge">{question.level}</span>
          <span className="points-badge">{question.points} pts</span>
        </div>

        <div className="question-text">
          {question.question}
        </div>

        {question.codeExample && (
          <div className="code-example">
            <pre><code>{question.codeExample}</code></pre>
          </div>
        )}

        {/* Answer Options */}
        <div className="answer-options">
          {question.options.map((option, index) => (
            <div 
              key={index}
              className={`answer-option ${
                selectedAnswer === index ? 'selected' : ''
              } ${
                showResult && index === question.correctAnswer ? 'correct' : ''
              } ${
                showResult && selectedAnswer === index && index !== question.correctAnswer ? 'incorrect' : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {showResult && index === question.correctAnswer && (
                <span className="correct-icon">✓</span>
              )}
              {showResult && selectedAnswer === index && index !== question.correctAnswer && (
                <span className="incorrect-icon">✗</span>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {!showResult ? (
          <div className="question-actions">
            <button 
              onClick={handleBackToDashboard}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={skipQuestion}
              className="btn-secondary"
            >
              Skip Question
            </button>
            <button 
              onClick={submitAnswer}
              className="btn-primary"
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div className="result-section">
            <div className={`result-feedback ${evaluation.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-header">
                <span className="result-icon">
                  {evaluation.isCorrect ? '🎉' : '📚'}
                </span>
                <span className="result-text">
                  {evaluation.isCorrect ? 'Correct!' : 'Not quite right'}
                </span>
                <span className="points-earned">+{evaluation.earnedPoints} pts</span>
              </div>
              
              <div className="explanation">
                {evaluation.feedback}
              </div>

              {evaluation.rating && (
                <div className="performance-rating">
                  <span className="rating-label">Performance:</span>
                  <span className={`rating-badge ${evaluation.rating}`}>
                    {evaluation.rating.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="result-actions">
              <button 
                onClick={handleBackToDashboard}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={generateNewQuestion}
                className="btn-primary next-question-btn"
              >
                Next Question
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Session Completion Modal */}
      {showCompletionModal && (
        <div className="completion-modal-overlay">
          <div className="completion-modal">
            <div className="completion-header">
              <h2>🎉 Great Session!</h2>
              <p>You've completed {sessionStats.totalQuestions} questions</p>
            </div>
            
            <div className="completion-stats">
              <div className="completion-stat">
                <span className="stat-number">{sessionStats.correctAnswers}</span>
                <span className="stat-label">Correct Answers</span>
              </div>
              <div className="completion-stat">
                <span className="stat-number">{sessionStats.totalPoints}</span>
                <span className="stat-label">Points Earned</span>
              </div>
              <div className="completion-stat">
                <span className="stat-number">{Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100)}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
            
            <div className="completion-actions">
              <button 
                onClick={handleSessionComplete}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={continueSession}
                className="btn-secondary"
              >
                Continue Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionInterface;
