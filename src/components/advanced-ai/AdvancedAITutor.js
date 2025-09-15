import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaCode, FaLightbulb, FaCopy, FaThumbsUp, FaThumbsDown, FaBookOpen, FaChartLine, FaBrain, FaSpinner } from 'react-icons/fa';
import './AdvancedAITutor.css';

const AdvancedAITutor = ({ currentUser, onLearningProgress }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorPersonality, setTutorPersonality] = useState('friendly');
  const [conversationMode, setConversationMode] = useState('general');
  const [codeToAnalyze, setCodeToAnalyze] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [learningContext, setLearningContext] = useState({
    currentSubject: 'javascript',
    skillLevel: currentUser?.level || 'beginner',
    recentTopics: [],
    weakAreas: []
  });
  
  const messagesEndRef = useRef(null);

  // AI Tutor Personalities
  const tutorPersonalities = {
    friendly: {
      name: "Alex",
      avatar: "🤖",
      description: "Encouraging and patient tutor",
      systemPrompt: "You are Alex, a friendly AI programming tutor. Use simple explanations and positive reinforcement."
    },
    expert: {
      name: "Dr. Code",
      avatar: "👨‍💻", 
      description: "Professional coding mentor",
      systemPrompt: "You are Dr. Code, an expert programming mentor. Provide detailed technical explanations."
    },
    creative: {
      name: "Spark",
      avatar: "✨",
      description: "Creative problem solver",
      systemPrompt: "You are Spark, a creative AI tutor. Encourage innovative solutions and creative thinking."
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        personality: tutorPersonality
      };
      setMessages([welcomeMessage]);
    }
  }, [tutorPersonality]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getWelcomeMessage = () => {
    const personality = tutorPersonalities[tutorPersonality];
    return `Hi! I'm ${personality.name} ${personality.avatar}, your AI programming tutor. I'm here to help you learn and improve your coding skills. What would you like to work on today?`;
  };

  const generateAIResponse = async (userMessage) => {
    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        return generateFallbackResponse(userMessage);
      }

      const personality = tutorPersonalities[tutorPersonality];
      const systemPrompt = `${personality.systemPrompt}
      
      Student Context:
      - Name: ${currentUser?.name || 'Student'}
      - Skill Level: ${learningContext.skillLevel}
      - Current Subject: ${learningContext.currentSubject}
      
      Keep responses helpful and concise (2-3 paragraphs max).`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('AI response generation failed:', error);
      return generateFallbackResponse(userMessage);
    }
  };

  const generateFallbackResponse = (userMessage) => {
    const personality = tutorPersonalities[tutorPersonality];
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('code') || lowerMessage.includes('function')) {
      return `${personality.avatar} Great question about coding! Here are some key points:

• Start with clean, readable code - use meaningful variable names
• Break complex problems into smaller functions  
• Test your code frequently as you write it
• Don't hesitate to refactor when needed

Would you like me to review some specific code or explain a particular concept?`;
    }
    
    if (lowerMessage.includes('learn') || lowerMessage.includes('explain')) {
      return `${personality.avatar} I'd love to help you learn! Here's my approach:

• We'll start with fundamentals and build up gradually
• I'll provide practical examples you can try
• We can work through problems step-by-step
• Feel free to ask questions anytime!

What specific topic would you like to explore?`;
    }
    
    return `${personality.avatar} Thanks for your question! I can help you with:

• Code review and feedback
• Explaining programming concepts  
• Debugging assistance
• Learning path recommendations
• Practice problem suggestions

What would you like to focus on today?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        personality: tutorPersonality
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="advanced-ai-tutor">
      <div className="tutor-header">
        <div className="tutor-title">
          <FaBrain className="tutor-icon" />
          <h1>Advanced AI Tutor</h1>
        </div>
        <div className="tutor-subtitle">
          <p>Your personalized AI programming mentor</p>
        </div>
      </div>

      <div className="tutor-controls">
        <div className="personality-selector">
          <label>Choose Your Tutor:</label>
          <div className="personality-options">
            {Object.entries(tutorPersonalities).map(([key, personality]) => (
              <button
                key={key}
                className={`personality-btn ${tutorPersonality === key ? 'active' : ''}`}
                onClick={() => setTutorPersonality(key)}
              >
                <span className="personality-avatar">{personality.avatar}</span>
                <div className="personality-info">
                  <span className="personality-name">{personality.name}</span>
                  <span className="personality-desc">{personality.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mode-selector">
          <label>Conversation Mode:</label>
          <select 
            value={conversationMode} 
            onChange={(e) => setConversationMode(e.target.value)}
            className="mode-select"
          >
            <option value="general">General Help</option>
            <option value="code-review">Code Review</option>
            <option value="learning">Learning Path</option>
            <option value="debugging">Debugging</option>
          </select>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-header">
                <span className="message-author">
                  {message.type === 'ai' ? 
                    `${tutorPersonalities[message.personality || tutorPersonality].name} ${tutorPersonalities[message.personality || tutorPersonality].avatar}` : 
                    `${currentUser?.name || 'You'} 👤`
                  }
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">
                {message.content}
              </div>
              {message.type === 'ai' && (
                <div className="message-actions">
                  <button onClick={() => copyMessage(message.content)} className="action-btn">
                    <FaCopy /> Copy
                  </button>
                  <button className="action-btn">
                    <FaThumbsUp /> Helpful
                  </button>
                  <button className="action-btn">
                    <FaThumbsDown /> Not Helpful
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai loading">
              <div className="message-header">
                <span className="message-author">
                  {tutorPersonalities[tutorPersonality].name} {tutorPersonalities[tutorPersonality].avatar}
                </span>
              </div>
              <div className="message-content">
                <FaSpinner className="loading-spinner" /> Thinking...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${tutorPersonalities[tutorPersonality].name} anything about programming...`}
              rows="2"
              className="message-input"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <div className="learning-context-panel">
        <h3><FaChartLine /> Learning Context</h3>
        <div className="context-grid">
          <div className="context-item">
            <label>Current Subject:</label>
            <select 
              value={learningContext.currentSubject}
              onChange={(e) => setLearningContext(prev => ({...prev, currentSubject: e.target.value}))}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="react">React</option>
              <option value="nodejs">Node.js</option>
            </select>
          </div>
          <div className="context-item">
            <label>Skill Level:</label>
            <select 
              value={learningContext.skillLevel}
              onChange={(e) => setLearningContext(prev => ({...prev, skillLevel: e.target.value}))}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3><FaLightbulb /> Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("Can you review this code for me?")}
          >
            <FaCode /> Code Review
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("I need help debugging this error")}
          >
            <FaLightbulb /> Debug Help
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("What should I learn next?")}
          >
            <FaBookOpen /> Learning Path
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("Can you explain this concept to me?")}
          >
            <FaBrain /> Explain Concept
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAITutor;