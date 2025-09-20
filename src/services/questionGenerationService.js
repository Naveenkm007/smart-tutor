// Question Generation Service using LLM integration
class QuestionGenerationService {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_LLM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.usedQuestions = new Set(); // Track used questions to avoid repetition
  }

  /**
   * Generate a programming question based on topic and level
   * @param {string} language - Programming language (cpp, java, python)
   * @param {string} level - Proficiency level (basic, intermediate, advanced)
   * @param {string} specificTopic - Optional specific topic within the language
   * @returns {Object} Generated question object
   */
  async generateQuestion(language, level, specificTopic = null) {
    const prompt = this.buildPrompt(language, level, specificTopic);
    
    try {
      // If no API key is configured, return a demo question
      if (!this.apiKey) {
        return this.getDemoQuestion(language, level);
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert programming instructor. Generate educational programming questions with clear explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      return this.parseQuestionResponse(generatedContent, language, level);
    } catch (error) {
      console.error('Question generation failed:', error);
      // Fallback to demo questions
      return this.getDemoQuestion(language, level);
    }
  }

  /**
   * Build prompt for question generation
   */
  buildPrompt(language, level, specificTopic) {
    const languageSpecs = {
      cpp: 'C++',
      java: 'Java', 
      python: 'Python'
    };

    const levelDescriptions = {
      basic: 'beginner level with fundamental concepts',
      intermediate: 'intermediate level with practical applications',
      advanced: 'advanced level with complex problem-solving'
    };

    const topicFocus = specificTopic ? ` focusing on ${specificTopic}` : '';

    return `Generate a ${levelDescriptions[level]} ${languageSpecs[language]} programming question${topicFocus}. 

Return the response in this exact JSON format:
{
  "question": "Clear question statement",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation of the correct answer",
  "codeExample": "Optional code snippet if applicable",
  "difficulty": "${level}",
  "topic": "specific topic name",
  "points": ${level === 'basic' ? 10 : level === 'intermediate' ? 20 : 30}
}

Make the question educational, practical, and appropriate for the specified level.`;
  }

  /**
   * Parse LLM response into question object
   */
  parseQuestionResponse(response, language, level) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const questionData = JSON.parse(jsonMatch[0]);
        return {
          id: `${language}_${level}_${Date.now()}`,
          language,
          level,
          timestamp: new Date().toISOString(),
          ...questionData
        };
      }
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
    }
    
    // Fallback if parsing fails
    return this.getDemoQuestion(language, level);
  }

  /**
   * Get demo questions when API is not available
   */
  getDemoQuestion(language, level) {
    const questionPool = this.getQuestionPool();
    const availableQuestions = questionPool[language]?.[level] || questionPool.cpp.basic;
    
    // Filter out used questions if we have enough options
    let questionsToChooseFrom = availableQuestions;
    if (availableQuestions.length > 1) {
      const unusedQuestions = availableQuestions.filter(q => 
        !this.usedQuestions.has(`${language}_${level}_${q.id}`)
      );
      
      if (unusedQuestions.length > 0) {
        questionsToChooseFrom = unusedQuestions;
      } else {
        // Reset used questions if all have been used
        this.usedQuestions.clear();
        questionsToChooseFrom = availableQuestions;
      }
    }
    
    // Randomly select a question
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];
    
    const questionId = `${language}_${level}_${selectedQuestion.id}_${Date.now()}`;
    this.usedQuestions.add(`${language}_${level}_${selectedQuestion.id}`);
    
    return {
      id: questionId,
      language,
      level,
      timestamp: new Date().toISOString(),
      ...selectedQuestion
    };
  }

  /**
   * Get comprehensive question pool with multiple questions per level
   */
  getQuestionPool() {
    return {
      cpp: {
        basic: [
          {
            id: "cpp_basic_1",
            question: "What is the correct way to declare an integer variable in C++?",
            options: ["int x;", "integer x;", "var x;", "number x;"],
            correctAnswer: 0,
            explanation: "In C++, 'int' is the keyword used to declare integer variables. The syntax is 'int variableName;'",
            codeExample: "int age = 25;\nint count;",
            topic: "Variable Declaration",
            points: 10
          },
          {
            id: "cpp_basic_2",
            question: "Which of the following is the correct syntax for a C++ comment?",
            options: ["// This is a comment", "# This is a comment", "/* This is a comment", "' This is a comment"],
            correctAnswer: 0,
            explanation: "C++ uses // for single-line comments and /* */ for multi-line comments.",
            codeExample: "// Single line comment\n/* Multi-line\n   comment */",
            topic: "Comments",
            points: 10
          },
          {
            id: "cpp_basic_3",
            question: "What is the output of: cout << 5 + 3 << endl;",
            options: ["5 + 3", "8", "53", "Error"],
            correctAnswer: 1,
            explanation: "The expression 5 + 3 is evaluated first, resulting in 8, which is then printed.",
            codeExample: "#include <iostream>\nusing namespace std;\nint main() {\n    cout << 5 + 3 << endl;\n    return 0;\n}",
            topic: "Basic Operations",
            points: 10
          },
          {
            id: "cpp_basic_4",
            question: "Which header file is required for input/output operations in C++?",
            options: ["<stdio.h>", "<iostream>", "<conio.h>", "<string.h>"],
            correctAnswer: 1,
            explanation: "<iostream> is the standard header for input/output operations, providing cout, cin, endl, etc.",
            codeExample: "#include <iostream>\nusing namespace std;",
            topic: "Header Files",
            points: 10
          }
        ],
        intermediate: [
          {
            id: "cpp_inter_1",
            question: "What will be the output of this C++ code?\nint arr[] = {1, 2, 3, 4, 5};\nint *ptr = arr + 2;\ncout << *ptr;",
            options: ["1", "2", "3", "4"],
            correctAnswer: 2,
            explanation: "arr + 2 moves the pointer to the third element (index 2) of the array. *ptr dereferences it to get the value 3.",
            codeExample: "int arr[] = {1, 2, 3, 4, 5};\nint *ptr = arr + 2;  // Points to arr[2]\ncout << *ptr;  // Outputs 3",
            topic: "Pointers and Arrays",
            points: 20
          },
          {
            id: "cpp_inter_2",
            question: "What is the difference between ++i and i++?",
            options: [
              "No difference",
              "++i increments before use, i++ increments after use",
              "++i is faster than i++",
              "i++ can only be used in loops"
            ],
            correctAnswer: 1,
            explanation: "++i (pre-increment) increments the value before using it in the expression. i++ (post-increment) uses the current value first, then increments.",
            codeExample: "int i = 5;\nint a = ++i;  // i=6, a=6\nint j = 5;\nint b = j++;  // j=6, b=5",
            topic: "Operators",
            points: 20
          }
        ],
        advanced: [
          {
            id: "cpp_adv_1",
            question: "Which of the following demonstrates proper RAII (Resource Acquisition Is Initialization) in C++?",
            options: [
              "Using malloc() and free()",
              "Using smart pointers like unique_ptr",
              "Manual resource management",
              "Global variables for resources"
            ],
            correctAnswer: 1,
            explanation: "RAII is best implemented using smart pointers like unique_ptr, shared_ptr which automatically manage resource lifetime through constructors and destructors.",
            codeExample: "std::unique_ptr<int[]> data(new int[100]);\n// Automatically deallocated when out of scope",
            topic: "RAII and Smart Pointers",
            points: 30
          }
        ]
      },
      python: {
        basic: [
          {
            id: "python_basic_1",
            question: "How do you create a list in Python?",
            options: ["list = []", "list = ()", "list = {}", "list = <>"],
            correctAnswer: 0,
            explanation: "Square brackets [] are used to create lists in Python. Lists are ordered, mutable collections that can hold different data types.",
            codeExample: "my_list = [1, 2, 3, 'hello']\nempty_list = []",
            topic: "Data Structures",
            points: 10
          },
          {
            id: "python_basic_2",
            question: "Which of the following is the correct way to print in Python 3?",
            options: ["print 'Hello'", "print('Hello')", "echo 'Hello'", "console.log('Hello')"],
            correctAnswer: 1,
            explanation: "In Python 3, print is a function and requires parentheses: print('text')",
            codeExample: "print('Hello, World!')\nprint('Python', 'is', 'awesome')",
            topic: "Basic Syntax",
            points: 10
          },
          {
            id: "python_basic_3",
            question: "What is the correct way to define a function in Python?",
            options: ["function myFunc():", "def myFunc():", "func myFunc():", "define myFunc():"],
            correctAnswer: 1,
            explanation: "Python uses the 'def' keyword to define functions, followed by the function name and parentheses.",
            codeExample: "def greet(name):\n    return f'Hello, {name}!'",
            topic: "Functions",
            points: 10
          }
        ],
        intermediate: [
          {
            id: "python_inter_1",
            question: "What is the output of this Python code?\ndef func(lst=[]):\n    lst.append(1)\n    return lst\n\nprint(func())\nprint(func())",
            options: ["[1] [1]", "[1] [1, 1]", "Error", "[] []"],
            correctAnswer: 1,
            explanation: "This demonstrates the mutable default argument trap. The default list is shared between function calls, so each call appends to the same list.",
            codeExample: "# Correct way:\ndef func(lst=None):\n    if lst is None:\n        lst = []\n    lst.append(1)\n    return lst",
            topic: "Function Default Arguments",
            points: 20
          }
        ],
        advanced: [
          {
            id: "python_adv_1",
            question: "Which Python feature allows a function to maintain state between calls without using global variables?",
            options: ["Lambda functions", "Closures", "Decorators", "Generators"],
            correctAnswer: 1,
            explanation: "Closures allow inner functions to access variables from the outer function's scope, maintaining state between calls even after the outer function returns.",
            codeExample: "def counter():\n    count = 0\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n    return increment\n\nc = counter()\nprint(c())  # 1\nprint(c())  # 2",
            topic: "Closures and Scope",
            points: 30
          }
        ]
      }
    };
  }

  /**
   * Evaluate user's answer and calculate score
   */
  evaluateAnswer(question, userAnswer, timeSpent) {
    const isCorrect = parseInt(userAnswer) === question.correctAnswer;
    const basePoints = question.points || 10;
    
    let earnedPoints = 0;
    let rating = 'poor';
    
    if (isCorrect) {
      earnedPoints = basePoints;
      
      // Time bonus (if answered quickly)
      if (timeSpent < 30000) { // Less than 30 seconds
        earnedPoints += Math.floor(basePoints * 0.2);
        rating = 'excellent';
      } else if (timeSpent < 60000) { // Less than 1 minute
        rating = 'good';
      } else {
        rating = 'average';
      }
    } else {
      rating = 'poor';
    }

    return {
      isCorrect,
      earnedPoints,
      rating,
      maxPoints: basePoints,
      accuracy: isCorrect ? 100 : 0,
      timeSpent,
      feedback: isCorrect 
        ? `Correct! ${question.explanation}` 
        : `Incorrect. ${question.explanation}`
    };
  }

  /**
   * Update user proficiency level based on performance
   */
  updateProficiencyLevel(currentLevel, accuracy, consecutiveCorrect) {
    const levelOrder = ['basic', 'intermediate', 'advanced'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    
    // Promote if high accuracy and consecutive correct answers
    if (accuracy > 85 && consecutiveCorrect >= 3 && currentIndex < levelOrder.length - 1) {
      return levelOrder[currentIndex + 1];
    }
    
    // Demote if low accuracy
    if (accuracy < 50 && currentIndex > 0) {
      return levelOrder[currentIndex - 1];
    }
    
    return currentLevel;
  }
}

export default QuestionGenerationService;
