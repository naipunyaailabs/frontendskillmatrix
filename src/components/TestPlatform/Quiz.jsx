import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Alert, Spinner } from "react-bootstrap";
import Question from './Question';
import Result from './Result';
import "./TestPlatform.css";
import { axiosInstance } from '../../axiosUtils';
const Quiz = ({ proctored = true, onComplete }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState(null);
  
  // Proctoring state
  const [tabActive, setTabActive] = useState(true);
  const [violations, setViolations] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

// Timer state (15 minutes = 900 seconds)
const [timeLeft, setTimeLeft] = useState(900); // Restore to 15 mins
const [timerActive, setTimerActive] = useState(true);

 // Initialize userAnswers when questions load
 useEffect(() => {
  if (questions.length > 0 && userAnswers.length === 0) {
    setUserAnswers(Array(questions.length).fill(null));
  }
}, [questions]);
// Timer countdown effect
useEffect(() => {
  if (!timerActive || quizCompleted) return;

  const timer = setInterval(() => {
    setTimeLeft((prevTime) => {
      if (prevTime <= 1) {
        clearInterval(timer);
        handleAutoSubmit();
        return 0;
      }
      return prevTime - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timerActive, quizCompleted, userAnswers]); // Add userAnswers to dependencies


const handleAutoSubmit = async () => {
  console.log("Auto-submitting MCQ...");
  setTimerActive(false);
  setQuizCompleted(true);
  
  // Calculate final score based on all answered questions
  const finalScore = Math.round((score / questions.length) * 100);
  console.log("Final MCQ Score:", finalScore);

  if (onComplete) {
    console.log("Calling onComplete...");
    await onComplete(finalScore);
  } else {
    console.error("onComplete not provided!");
  }
};

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch questions from API when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // First try to get questions from assessment session
        const response = await axiosInstance.get(
          `/api/assessment-questions/${token}`
        );
        
        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
        } else {
          throw new Error('No questions found for this assessment');
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setErrorLoadingQuestions('Failed to load questions. Please try again later.');
        
        // Fallback to default questions if in development
        if (process.env.NODE_ENV === 'development') {
          setQuestions([
            {
              question: "What is the capital of France?",
              options: ["Berlin", "Madrid", "Paris", "Rome"],
              correctAnswer: "Paris",
            },
            {
              question: "Which hook is used to manage state in functional components?",
              options: ["useEffect", "useState", "useContext", "useReducer"],
              correctAnswer: "useState",
            }
          ]);
          setErrorLoadingQuestions(null);
        }
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [token]);

  // Proctoring effects
  useEffect(() => {
    if (!proctored) return;

    // Tab switching detection
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      setTabActive(isActive);
      
      if (!isActive) {
        const newViolations = violations + 1;
        setViolations(newViolations);
        setShowWarning(true);
        
        if (newViolations > 2) {
          alert('Warning: Multiple tab switching violations detected. This may invalidate your assessment.');
        }
      }
    };

    // Fullscreen detection
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    // Enforce fullscreen if proctored
    if (proctored && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [proctored, violations]);
// Update handleAnswer to store user answer
const handleAnswer = async (selectedAnswer) => {
  if (questions.length === 0) return;
  
  // Update local state immediately for UI responsiveness
  const newAnswers = [...userAnswers];
  newAnswers[currentQuestion] = selectedAnswer;
  setUserAnswers(newAnswers);

  const updatedQuestions = [...questions];
  updatedQuestions[currentQuestion].userAnswer = selectedAnswer;
  setQuestions(updatedQuestions);

  // Persist to backend
  try {
    await axiosInstance.patch(`/api/update-answer/${token}`, {
      questionId: questions[currentQuestion].id,
      userAnswer: selectedAnswer
    });
  } catch (error) {
    console.error('Failed to save answer:', error);
    // Consider adding retry logic here
  }

  // Recalculate score
  const newScore = questions.reduce((total, question, index) => {
    return total + (newAnswers[index] === question.correctAnswer ? 1 : 0);
  }, 0);
  setScore(newScore);
};

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowWarning(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowWarning(false);
    }
  };

const handleSubmit = async () => {
  if (questions.length === 0) return;
  
  // Calculate final score (percentage)
  const finalScore = Math.round((score / questions.length) * 100);
  
  if (proctored) {
    // If part of proctored assessment, use the onComplete callback
    if (onComplete) {
      await onComplete(finalScore, questions); // Pass questions with answers
    }
  } else {
    // Standalone quiz mode - submit directly to backend
    try {
      await axiosInstance.post('/api/submit-score', {
        token,
        score: finalScore,
        answers: questions.map(q => ({
          id: q.id,
          question: q.question,
          userAnswer: q.userAnswer
        }))
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }
  
  setQuizCompleted(true);
};

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setViolations(0);
    navigate(proctored ? '/' : `/quiz/${token}`);
  };

  if (loadingQuestions) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading questions...</span>
        </Spinner>
        <p className="mt-3">Preparing your assessment questions...</p>
      </div>
    );
  }

  if (errorLoadingQuestions) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Questions</Alert.Heading>
          <p>{errorLoadingQuestions}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">MCQ Test</h1>
      
      {proctored && (
        <div className="proctoring-alerts mb-3">
         {/* Timer Display */}
         <div className="timer-display mb-2">
            <span className="badge bg-danger">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>

          {!fullscreen && (
            <Alert variant="danger" className="mb-2">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Please enable fullscreen mode for your assessment
            </Alert>
          )}
          
          {showWarning && (
            <Alert variant="warning" className="mb-2" onClose={() => setShowWarning(false)} dismissible>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Tab switching detected ({violations} violation{violations !== 1 ? 's' : ''})
            </Alert>
          )}
          
        
        </div>
      )}
      
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>Job Assessment Test</h2>
          <p>Test your knowledge and skills for the job position.</p>
        </div>
        
        <div className="question-card">
          {!quizCompleted && questions.length > 0 ? (
            <>
              <Question
                question={questions[currentQuestion].question}
                options={questions[currentQuestion].options}
                selectedAnswer={userAnswers[currentQuestion]}
                onAnswer={handleAnswer}
              />
              
              <div className="navigation-buttons mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="me-2"
                >
                  Previous
                </Button>
                
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                  >
                    Submit Test
                  </Button>
                )}
              </div>
              
              <div className="progress mt-3">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  aria-valuenow={currentQuestion + 1}
                  aria-valuemin="0"
                  aria-valuemax={questions.length}
                >
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>
            </>
          ) : quizCompleted ? (
            <Result 
              score={score} 
              totalQuestions={questions.length} 
              onRestart={restartQuiz}
              violations={proctored ? violations : 0}
            />
          ) : (
            <Alert variant="danger">
              No questions available for this assessment.
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;