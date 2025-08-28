import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faStop, faExpand, faCompress, 
  faMinus, faTimes, faCheckCircle, faExclamationTriangle,
  faUser, faVideo, faMicrophone, faDesktop
} from '@fortawesome/free-solid-svg-icons';
import Quiz from './Quiz';
import VoiceAssessment from './VoiceAssessment';
import "./TestPlatform.css";
import { axiosInstance } from '../../axiosUtils';
const AssessmentPlatform = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  

 // Recording state
 const [recording, setRecording] = useState(false);
 const [mediaBlob, setMediaBlob] = useState(null);
 const [screenBlob, setScreenBlob] = useState(null);
 const [transcription, setTranscription] = useState(null);
 const [recordingId, setRecordingId] = useState(null);
 
 // UI state
 const [isCameraPopupOpen, setIsCameraPopupOpen] = useState(false);
 const [isMinimized, setIsMinimized] = useState(false);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [currentStep, setCurrentStep] = useState(1); // 1: Instructions, 2: Verification, 3: Consent, 4: Quiz
 const [systemCheck, setSystemCheck] = useState({
   camera: false,
   microphone: false,
   screenShare: false
 });
 const [tabActive, setTabActive] = useState(true);
 const [consentGiven, setConsentGiven] = useState(false);
 const [session, setSession] = useState(null);

 // Refs
 const mediaStreamRef = useRef(null);
 const screenStreamRef = useRef(null);
 const recorderRef = useRef(null);
 const screenRecorderRef = useRef(null);
 const fullscreenElementRef = useRef(null);
  // Add this effect at the start of the component
// Replace your validation useEffect with this:
const [validationComplete, setValidationComplete] = useState(false);
const [assessmentPhase, setAssessmentPhase] = useState('mcq');

useEffect(() => {
  const validateSession = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/validate-assessment/${token}`
      );
      
      if (!response.data.valid) {
        let redirectMessage = response.data.error || 'Invalid assessment link';
        
        if (response.data.status === 'completed') {
          redirectMessage = 'This assessment has already been completed successfully.';
        }
        
        alert(redirectMessage);
        navigate('/');
        return;
      }
      
      setValidationComplete(true);
    } catch (error) {
      console.error('Validation error:', error);
      navigate('/');
    }
  };

  validateSession();
}, [token, navigate]);

  // Initialize session
  useEffect(() => {
    // Then wrap your entire component JSX with:
    if (!validationComplete) return; // Early exit here instead
  
    const initializeSession = async () => {
      try {
        const response = await axiosInstance.post('/api/start-assessment-recording', { token });
        setSession(response.data);
      } catch (error) {
        console.error('Error starting assessment:', error);
        alert('Failed to initialize assessment session.');
      }
    };
    initializeSession();
  }, [token, validationComplete]);
 
  // System check
  const checkSystemRequirements = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStream.getTracks().forEach(track => track.stop());
      
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach(track => track.stop());
      
      setSystemCheck({
        camera: true,
        microphone: true,
        screenShare: true // Will be verified during recording
      });
      
      return true;
    } catch (error) {
      console.error("System check failed:", error);
      return false;
    }
  };

  // Tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setTabActive(!document.hidden);
      if (document.hidden && recording) {
        alert("Please don't switch tabs during the assessment!");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [recording]);

  // Start recording
  const startRecording = async () => {
    try {

      const validation = await axiosInstance.get(
        `/api/validate-assessment/${token}`
      );
      
      if (!validation.data.valid) {
        alert(validation.data.error || 'Assessment link is no longer valid');
        navigate('/');
        return;
      }
      // Start camera recording
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      mediaStreamRef.current = cameraStream;
      recorderRef.current = new RecordRTC(cameraStream, { type: "video" });
      recorderRef.current.startRecording();

      // Start screen recording
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      screenStream.getVideoTracks()[0].onended = () => {
        if (recording) stopRecording();
      };

      screenStreamRef.current = screenStream;
      screenRecorderRef.current = new RecordRTC(screenStream, { type: "video" });
      screenRecorderRef.current.startRecording();

      // Enter fullscreen mode
      toggleFullscreen();

      setRecording(true);
      setIsCameraPopupOpen(true);
      setCurrentStep(4); // Move to quiz step
    } catch (error) {
      console.error("Error accessing media:", error);
      stopAllMediaTracks();
    }
  };

  // Stop recording and upload
  const stopRecording = async () => {
    if (!recorderRef.current || !screenRecorderRef.current) return;

    recorderRef.current.stopRecording(() => {
      const cameraBlob = recorderRef.current.getBlob();
      setMediaBlob(cameraBlob);

      screenRecorderRef.current.stopRecording(async () => {
        const screenBlob = screenRecorderRef.current.getBlob();
        setScreenBlob(screenBlob);

        const formData = new FormData();
        formData.append("cameraFile", cameraBlob, "camera_recording.webm");
        formData.append("screenFile", screenBlob, "screen_recording.webm");
        formData.append("assessmentToken", token);  // Add this line

        try {
          const response = await axiosInstance.post("/upload", formData);
          setRecordingId(response.data.file._id);
          return response.data.file._id;
        } catch (error) {
          console.error("Upload error:", error);
          return null;
        }
      });
    });

    setRecording(false);
    setIsCameraPopupOpen(false);
    stopAllMediaTracks();
  };

// In your existing startRecording function - NO CHANGES NEEDED
// It already starts both camera and screen recording

// In your completeAssessment function - MODIFY TO NOT STOP RECORDING
const completeAssessment = async (score) => {
  console.log("MCQ completed with score:", score);
  try {
    const response = await axiosInstance.post('/api/complete-assessment', {
      token,
      score,
    });
    console.log("Backend response:", response.data);
    
    setAssessmentPhase('voice');
    console.log("Moved to Voice Assessment phase");
  } catch (error) {
    console.error("Error in completeAssessment:", error);
    setAssessmentPhase('completed');
  }
};

// Add new function to handle final completion
const completeVoiceAssessment = async () => {
  try {
    const recordingId = await stopRecording(); // Now we stop recording here
    
    await axiosInstance.post('/api/complete-voice-assessment', { 
      token,
      recordingId // Pass recording ID when voice assessment is done
    });
    
    setCurrentStep(5);
    setAssessmentPhase('completed');
  } catch (error) {
    console.error('Error completing voice assessment:', error);
    setCurrentStep(5);
    setAssessmentPhase('completed');
  }
};

// Add this new function to handle final completion
const handleFinalCompletion = () => {
  setCurrentStep(5);
  setAssessmentPhase('completed');
  // Ensure all media is stopped
  stopAllMediaTracks();
};
  // Clean up
  const stopAllMediaTracks = () => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
  };

  // Toggle fullscreen
// Modify the fullscreen toggle function
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      document.documentElement.classList.add('fullscreen-enabled');
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      document.documentElement.classList.remove('fullscreen-enabled');
      setIsFullscreen(false);
    }
  } catch (err) {
    console.error('Fullscreen error:', err);
  }
};
// Add this effect to handle pointer events
useEffect(() => {
  const handleFullscreenChange = () => {
    if (document.fullscreenElement) {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  };
}, []);
if (!validationComplete) {
  return <div className="text-center p-5">Validating assessment link...</div>;
}
  // Render steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Instructions
        return (
       <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3">
  <div className="card shadow-lg" style={{ maxWidth: "600px", width: "100%" }}>
    <div className="card-header bg-gradient bg-primary text-white text-center">
      <h3 className="mb-0 fs-4 fw-semibold">Assessment Instructions</h3>
    </div>
    <div className="card-body">
      <ol className="list-group list-group-numbered list-group-flush">
        <li className="list-group-item fs-6">Ensure you're in a quiet, well-lit environment</li>
        <li className="list-group-item fs-6">Close all unnecessary applications</li>
        <li className="list-group-item fs-6">Have your ID ready if required</li>
        <li className="list-group-item fs-6">Test your equipment before starting</li>
        <li className="list-group-item fs-6">The session will be recorded</li>
        <li className="list-group-item fs-6">You'll complete an MCQ test after verification</li>
      </ol>

      <div className="d-grid gap-2 mt-4">
        <button
          className="btn btn-primary btn-lg fw-semibold"
          onClick={async () => {
            const ready = await checkSystemRequirements();
            if (ready) setCurrentStep(2);
          }}
          style={{ transition: "background-color 0.3s ease" }}
        >
          Begin System Check
        </button>
      </div>
    </div>
  </div>
</div>



        );
      
      case 2: // Verification
        return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3">
  <div className="card shadow-lg" style={{ maxWidth: "600px", width: "100%" }}>
    <div className="card-header bg-gradient bg-primary text-white text-center">
      <h3 className="mb-0 fs-4 fw-semibold">System Verification</h3>
    </div>
    <div className="card-body">
      <div className="list-group mb-4">
        <div
          className={`list-group-item d-flex align-items-center gap-2 fs-6 fw-medium 
            ${systemCheck.camera ? 'list-group-item-success' : 'list-group-item-warning'}`}
        >
          <FontAwesomeIcon
            icon={systemCheck.camera ? faCheckCircle : faExclamationTriangle}
            className={`text-${systemCheck.camera ? 'success' : 'warning'} fs-5`}
          />
          <span>Camera: {systemCheck.camera ? 'Working' : 'Not detected'}</span>
        </div>
        <div
          className={`list-group-item d-flex align-items-center gap-2 fs-6 fw-medium 
            ${systemCheck.microphone ? 'list-group-item-success' : 'list-group-item-warning'}`}
        >
          <FontAwesomeIcon
            icon={systemCheck.microphone ? faCheckCircle : faExclamationTriangle}
            className={`text-${systemCheck.microphone ? 'success' : 'warning'} fs-5`}
          />
          <span>Microphone: {systemCheck.microphone ? 'Working' : 'Not detected'}</span>
        </div>
      </div>

      <div className="d-grid gap-2">
        <button
          className="btn btn-primary btn-lg fw-semibold"
          onClick={() => setCurrentStep(3)}
          disabled={!systemCheck.camera || !systemCheck.microphone}
          style={{ transition: "background-color 0.3s ease" }}
        >
          Continue to Consent
        </button>
        <button
          className="btn btn-outline-secondary btn-lg fw-semibold"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </button>
      </div>
    </div>
  </div>
</div>

        );
      
      case 3: // Consent
        return (
         <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3">
  <div className="card shadow-lg w-100" style={{ maxWidth: '700px' }}>
    <div className="card-header bg-primary text-white text-center">
      <h3 className="mb-0 fs-4 fw-semibold">Recording Consent</h3>
    </div>
    <div className="card-body">
      <div className="alert alert-info mb-4">
        <h5 className="mb-2 fs-6 fw-semibold">By proceeding, you consent to:</h5>
        <ul className="mb-0 fs-6">
          <li>Recording of your camera, microphone, and screen</li>
          <li>Storage and processing of the recording</li>
          <li>Completion of an MCQ test under supervision</li>
        </ul>
      </div>

      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="consentCheck"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
        />
        <label className="form-check-label ms-2 fs-6 fw-medium" htmlFor="consentCheck">
          I understand and consent to the recording and assessment
        </label>
      </div>

      <div className="d-grid gap-2">
        <button
          className="btn btn-primary btn-lg fw-semibold"
          onClick={startRecording}
          disabled={!consentGiven}
          style={{ transition: 'background-color 0.3s ease' }}
        >
          Begin Assessment
        </button>
        <button
          className="btn btn-outline-secondary btn-lg fw-semibold"
          onClick={() => setCurrentStep(2)}
        >
          Back
        </button>
      </div>
    </div>
  </div>
</div>


        );
      
      case 4: // Quiz
        return (
          <div className="quiz-container">
           
            
            <Quiz 
              proctored={true} 
              onComplete={completeAssessment}
            />
          </div>
        );
      
        case 5: // Completion
        return (
         <div className="d-flex justify-content-center align-items-center vh-100">
  <div className="card shadow-lg mb-4">
    <div className="card-header bg-success text-white">
      <h3 className="mb-0">Assessment Complete</h3>
    </div>
    <div className="card-body">
      <div className="alert alert-success">
        <p>Your assessment has been successfully submitted!</p>
        <p><strong>This link is now expired.</strong> You cannot retake this assessment.</p>
      </div>
      <div className="d-grid">
        <button 
          className="btn btn-primary"
          onClick={() => {
            stopAllMediaTracks();
            navigate('/');
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  </div>
</div>

        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid assessment-platform" ref={fullscreenElementRef}>
      {/* Keep the header with recording indicator */}
      <header>
        <div className="container-fluid">
          {recording && (
            <div className="d-flex align-items-center">
              <span className="badge bg-danger me-3">
                <FontAwesomeIcon icon={faStop} className="me-1" />
                Recording
              </span>
             <button 
  className="btn btn-sm btn-outline-dark d-flex align-items-center"
  onClick={toggleFullscreen}
>
  <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="me-2" />
  {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
</button>

            </div>
          )}
        </div>
      </header>
  
      {/* Main content area with phase switching */}
      <main className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
           {assessmentPhase === 'mcq' ? (
            renderStepContent()
          ) : assessmentPhase === 'voice' ? (
          // Modify the onComplete prop being passed to VoiceAssessment
          <VoiceAssessment 
            onComplete={completeVoiceAssessment} // Use our new function
            onError={() => {
              setCurrentStep(5);
              setAssessmentPhase('completed');
            }}
          />

          ) : (
            renderStepContent() // This will show step 5 when phase is 'completed'
          )}
          </div>
        </div>
      </main>
  {/* Camera Pop-Up */}
      {isCameraPopupOpen && !isMinimized && (
        <Rnd
          default={{
            x: window.innerWidth - 320,
            y: 50,
            width: 250,
            height: 200,
          }}
          minWidth={250}
          minHeight={150}
          enableResizing
          className="camera-popup shadow-lg"
        >
          <div className="popup-header bg-dark text-white p-2 d-flex justify-content-between align-items-center">
            <h6 className="m-0">
              <FontAwesomeIcon icon={faVideo} className="me-5" />
            
            </h6>
            <div>
              <button 
                className="btn btn-sm btn-outline-light me-2" 
                onClick={() => setIsMinimized(true)}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <button 
                className="btn btn-sm btn-outline-light" 
                onClick={() => setIsCameraPopupOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          <video
            autoPlay
            muted
            ref={(video) => {
              if (video && mediaStreamRef.current) {
                video.srcObject = mediaStreamRef.current;
              }
            }}
            className="popup-video w-100 h-100"
          />
        </Rnd>
      )}

      {/* Minimized Pop-Up Button */}
      {isMinimized && (
        <button 
          className="btn btn-primary floating-btn shadow"
          onClick={() => {
            setIsMinimized(false);
            setIsCameraPopupOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faVideo} />
        </button>
      )}
     
    </div>
  );
};

export default AssessmentPlatform;