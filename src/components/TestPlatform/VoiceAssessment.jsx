import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faCheck,faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import RecordRTC from 'recordrtc';
import "./TestPlatform.css";
import { axiosInstance } from '../../axiosUtils';
const VoiceAssessment = ({ onComplete }) => {
  const { token } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  // Add this state
const [isSubmitting, setIsSubmitting] = useState(false);
  const audioChunks = useRef([]);

    
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  // Timer state (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);

  // Timer countdown effect
 // Add to VoiceAssessment component
// Update timer effect
useEffect(() => {
  if (!timerActive || recordedAnswers.length === questions.length) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        handleTimeout();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timerActive, recordedAnswers, questions]);

// Enhanced timeout handler
const handleTimeout = async () => {
  if (isSubmitting) return; // Prevent multiple submissions
  setIsSubmitting(true);
  
  try {
    // Stop any active recording
    if (isRecording && recorderRef.current) {
      await stopRecording();
    }

    // Submit all unanswered questions
    const unanswered = questions.filter(q => 
      !recordedAnswers.some(a => a.questionId === q.id)
    );

    const submissionPromises = unanswered.map(q => 
      axiosInstance.post('/api/submit-voice-answer', {
        token,
        questionId: q.id,
        question: q.question,
        skipped: true,
        durationSec: 0
      })
    );

    await Promise.all(submissionPromises);

    // Update local state to reflect skipped questions
    setRecordedAnswers(prev => [
      ...prev,
      ...unanswered.map(q => ({
        questionId: q.id,
        status: 'skipped',
        valid: false
      }))
    ]);

    // Complete assessment
    if (onComplete) {
      await onComplete();
    }
  } catch (error) {
    console.error('Auto-submission error:', error);
    // Even if submission fails, ensure we complete
    if (onComplete) {
      await onComplete();
    }
  } finally {
    setIsSubmitting(false);
  }
};
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  // Auto-complete when time expires
  const handleAutoComplete = async () => {
    setTimerActive(false);
    if (onComplete) {
      await onComplete();
    }
  };

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  // Safely get current question with proper fallbacks
  const currentQuestion = questions[currentQuestionIndex] || {};
  const currentQuestionText = currentQuestion.question || 'Question not available';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setError(null);
        
        const response = await axiosInstance.get(
          `/api/assessment-questions/${token}`,
        
        );
        
        // Validate and format questions
        const voiceQuestions = Array.isArray(response.data?.voiceQuestions) 
          ? response.data.voiceQuestions 
          : [];
        
        setQuestions(voiceQuestions.map((q, index) => ({
          id: q.id || `vq-${index}-${Date.now()}`, // Ensure unique ID
          question: q.question || `Voice question ${index + 1}`
        })));
        
      } catch (err) {
        console.error('Question fetch error:', err);
        setError(err.response?.data?.error || 
                err.message || 
                'Failed to load questions. Please refresh the page.');
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [token]);

  // Cleanup media resources
  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

   const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // Mono recording
        desiredSampRate: 16000, // 16kHz sample rate
        bufferSize: 4096,
        timeSlice: 1000, // Optional: Get chunks every second
        ondataavailable: (blob) => {
          // Optional: Handle chunks if needed
        }
      });
      
      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Microphone access denied. Please check permissions and try again.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording || !recorderRef.current) return;
    
    try {
      await new Promise((resolve) => {
        recorderRef.current.stopRecording(resolve);
      });
      
      const blob = recorderRef.current.getBlob();
      setIsRecording(false);
      await submitAnswer(blob);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to process recording. Please try again.');
      setIsRecording(false);
    } finally {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };


  const submitAnswer = async (audioBlob) => {
    if (!currentQuestion.id) {
      setError('Invalid question data. Please refresh the page.');
      return;
    }
  
    try {
      setIsProcessing(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      const filename = `answer-${currentQuestionIndex}-${Date.now()}.wav`;
      
      // Ensure we have a valid blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Invalid audio recording');
      }
  
      formData.append('audio', audioBlob, filename);
      formData.append('token', token);
      formData.append('questionId', currentQuestion.id);
      formData.append('question', currentQuestionText);
      
      const response = await axiosInstance.post('/api/submit-voice-answer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
        timeout: 30000 // 30 second timeout
      });
      
      setRecordedAnswers(prev => [
        ...prev, 
        { 
          questionId: currentQuestion.id, 
          status: response.data.valid ? 'uploaded' : 'invalid',
          valid: response.data.valid
        }
      ]);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        await completeAssessment();
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 
              err.message || 
              'Failed to submit answer. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeAssessment = async () => {
    try {
      setUploadProgress(100);
      await axiosInstance.post('/api/complete-voice-assessment', { token });
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Completion error:', err);
      setError('Failed to complete assessment. Your answers were saved but please contact support.');
    }
  };

  const getAnswerStatus = (questionId) => {
    return recordedAnswers.find(a => a.questionId === questionId)?.status || 'pending';
  };

  if (loadingQuestions) {
    return (
      <div className="container mt-4">
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading assessment questions...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Card className="shadow">
          <Card.Body className="text-center">
            <Alert variant="danger">{error}</Alert>
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
              className="mt-3"
            >
              Refresh Page
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mt-4">
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <Alert variant="warning">
              No voice questions available for this assessment
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mt-4">
         <div className="timer-display mb-2">
            <span className="badge bg-danger">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Voice Assessment</h3>
            <div className="text-end">
          
              <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
            </div>
          </div>
          <ProgressBar 
            now={((currentQuestionIndex + 1) / questions.length) * 100} 
            label={`${Math.round(((currentQuestionIndex) / questions.length) * 100)}%`}
            className="mt-2"
          />
        </Card.Header>
        <Card.Body>
          <div className="question-container mb-4">
            <h4>{currentQuestionText}</h4>
          </div>
          
          <div className="recording-controls text-center mb-4">
            {isRecording ? (
              <Button 
                variant="danger" 
                size="lg" 
                onClick={stopRecording}
                className="px-4"
              >
                <FontAwesomeIcon icon={faStop} className="me-2" />
                Stop Recording
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={startRecording}
                disabled={isProcessing || getAnswerStatus(currentQuestion.id) === 'uploaded'}
                className="px-4"
              >
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                    {getAnswerStatus(currentQuestion.id) === 'uploaded' ? 'Answered' : 'Start Recording'}
                  </>
                )}
              </Button>
            )}
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3">
                <ProgressBar 
                  now={uploadProgress} 
                  label={`${uploadProgress}%`} 
                  animated 
                />
                <p className="text-muted mt-2">Uploading your answer...</p>
              </div>
            )}
          </div>
          

        <div className="questions-progress mt-4">
          <h5>Question Progress</h5>
          <div className="d-flex flex-wrap gap-2">
            {questions.map((q, index) => {
              const answer = recordedAnswers.find(a => a.questionId === q.id);
              const status = answer 
                ? answer.valid ? 'completed' : 'invalid'
                : 'pending';
              return (
                <div 
                  key={q.id}
                  className={`question-indicator ${status}`}
                >
                  {index + 1}
                  {status === 'completed' && <FontAwesomeIcon icon={faCheck} className="ms-1" />}
                  {status === 'invalid' && <FontAwesomeIcon icon={faTimes} className="ms-1" />}
                </div>
              );
            })}
          </div>
        </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VoiceAssessment;