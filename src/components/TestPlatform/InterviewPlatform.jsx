import React, { useRef, useState, useEffect } from "react";
import RecordRTC from "recordrtc";
import axios from "axios";
import { Rnd } from "react-rnd";
import "bootstrap/dist/css/bootstrap.min.css";
/*import "../App.css"; */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faStop, faExpand, faCompress, 
  faMinus, faTimes, faCheckCircle, faExclamationTriangle,
  faUser, faVideo, faMicrophone, faDesktop
} from '@fortawesome/free-solid-svg-icons';
import "./TestPlatform.css";
import { axiosInstance } from "../../axiosUtils";
const InterviewPlatform = () => {
  // State management
  const [recording, setRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [screenBlob, setScreenBlob] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isCameraPopupOpen, setIsCameraPopupOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Instructions, 2: Verification, 3: Consent, 4: Recording
  const [systemCheck, setSystemCheck] = useState({
    camera: false,
    microphone: false,
    screenShare: false
  });
  const [tabActive, setTabActive] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);

  // Refs
  const mediaStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const screenRecorderRef = useRef(null);
  const fullscreenElementRef = useRef(null);

  // Check system requirements
  const checkSystemRequirements = async () => {
    try {
      // Check camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStream.getTracks().forEach(track => track.stop());
      setSystemCheck(prev => ({ ...prev, camera: true }));

      // Check microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach(track => track.stop());
      setSystemCheck(prev => ({ ...prev, microphone: true }));

      // Screen share can't be checked without user interaction
      setSystemCheck(prev => ({ ...prev, screenShare: true }));

      return true;
    } catch (error) {
      console.error("System check failed:", error);
      return false;
    }
  };

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setTabActive(!document.hidden);
      if (document.hidden && recording) {
        // Warn user when they switch tabs during recording
        alert("Please don't switch tabs during the interview recording!");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [recording]);

  // Prevent ESC key during fullscreen recording
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen && recording) {
        e.preventDefault();
        alert("Please use the stop button to end recording properly.");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, recording]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenElementRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Start the interview process
  const startInterviewProcess = async () => {
    const systemReady = await checkSystemRequirements();
    if (systemReady) {
      setCurrentStep(2); // Move to verification step
    }
  };

  // Start Recording (Camera + Screen)
  const startRecording = async () => {
    try {
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
      
      // Automatically stop recording if screen share is canceled
      screenStream.getVideoTracks()[0].onended = () => {
        if (recording) {
          stopRecording();
        }
      };

      screenStreamRef.current = screenStream;
      screenRecorderRef.current = new RecordRTC(screenStream, { type: "video" });
      screenRecorderRef.current.startRecording();

      // Enter fullscreen mode
      toggleFullscreen();

      setRecording(true);
      setIsCameraPopupOpen(true);
      setCurrentStep(4); // Move to recording step
    } catch (error) {
      console.error("Error accessing media:", error);
      stopAllMediaTracks();
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (!recorderRef.current || !screenRecorderRef.current) return;

    // Exit fullscreen first
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }

    recorderRef.current.stopRecording(() => {
      const cameraBlob = recorderRef.current.getBlob();
      setMediaBlob(cameraBlob);

      screenRecorderRef.current.stopRecording(() => {
        const screenBlob = screenRecorderRef.current.getBlob();
        setScreenBlob(screenBlob);

        uploadRecordings(cameraBlob, screenBlob);
      });
    });

    setRecording(false);
    setIsCameraPopupOpen(false);
  };

  // Clean up all media tracks
  const stopAllMediaTracks = () => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
  };

  // Upload Recordings
  const uploadRecordings = async (cameraBlob, screenBlob) => {
    const formData = new FormData();
    formData.append("cameraFile", cameraBlob, "camera_recording.webm");
    formData.append("screenFile", screenBlob, "screen_recording.webm");

    try {
      const response = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.transcription) {
        setTranscription(response.data.transcription.transcriptionPath);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMediaTracks();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Render onboarding steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Instructions
        return (
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Interview Recording Instructions</h3>
            </div>
            <div className="card-body">
              <ol className="list-group list-group-numbered list-group-flush">
                <li className="list-group-item">Ensure you're in a quiet, well-lit environment</li>
                <li className="list-group-item">Close all unnecessary applications</li>
                <li className="list-group-item">Have your ID ready if required</li>
                <li className="list-group-item">Test your equipment before starting</li>
                <li className="list-group-item">The interview will be recorded</li>
              </ol>
              <div className="d-grid gap-2 mt-3">
                <button 
                  className="btn btn-primary"
                  onClick={startInterviewProcess}
                >
                  Begin System Check
                </button>
              </div>
            </div>
          </div>
        );
      
      case 2: // Verification
        return (
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">System Verification</h3>
            </div>
            <div className="card-body">
              <div className="list-group mb-3">
                <div className={`list-group-item ${systemCheck.camera ? 'list-group-item-success' : 'list-group-item-warning'}`}>
                  <FontAwesomeIcon icon={systemCheck.camera ? faCheckCircle : faExclamationTriangle} className="me-2" />
                  Camera: {systemCheck.camera ? 'Working' : 'Not detected'}
                </div>
                <div className={`list-group-item ${systemCheck.microphone ? 'list-group-item-success' : 'list-group-item-warning'}`}>
                  <FontAwesomeIcon icon={systemCheck.microphone ? faCheckCircle : faExclamationTriangle} className="me-2" />
                  Microphone: {systemCheck.microphone ? 'Working' : 'Not detected'}
                </div>
                <div className={`list-group-item ${systemCheck.screenShare ? 'list-group-item-success' : 'list-group-item-warning'}`}>
                  <FontAwesomeIcon icon={systemCheck.screenShare ? faCheckCircle : faExclamationTriangle} className="me-2" />
                  Screen Sharing: {systemCheck.screenShare ? 'Available' : 'Will be tested'}
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(3)}
                  disabled={!systemCheck.camera || !systemCheck.microphone}
                >
                  Continue to Consent
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      
      case 3: // Consent
        return (
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Recording Consent</h3>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <p>By proceeding, you consent to:</p>
                <ul>
                  <li>Recording of your camera, microphone, and screen</li>
                  <li>Storage and processing of the recording</li>
                  <li>Analysis of your responses</li>
                </ul>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="consentCheck" 
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="consentCheck">
                  I understand and consent to the recording
                </label>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={startRecording}
                  disabled={!consentGiven}
                >
                  Start Interview
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      
      case 4: // Recording in progress
        return (
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-danger text-white">
              <h3 className="mb-0">Interview in Progress</h3>
            </div>
            <div className="card-body">
              <div className="alert alert-warning">
                <p className="mb-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  Please don't switch tabs or applications during the interview
                </p>
              </div>
              
              <div className="d-flex justify-content-center mb-3">
                <div className="system-status me-4">
                  <div className={`status-indicator ${tabActive ? 'active' : 'inactive'}`}>
                    {tabActive ? 'Tab Active' : 'Tab Inactive'}
                  </div>
                </div>
                <div className="recording-status">
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    Recording
                  </div>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-danger"
                  onClick={stopRecording}
                >
                  <FontAwesomeIcon icon={faStop} className="me-2" />
                  End Interview
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid interview-platform" ref={fullscreenElementRef}>
      <header className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <FontAwesomeIcon icon={faVideo} className="me-2" />
            Interview Recording Platform
          </span>
          {recording && (
            <div className="d-flex align-items-center">
              <span className="badge bg-danger me-3">
                <FontAwesomeIcon icon={faStop} className="me-1" />
                Recording
              </span>
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={toggleFullscreen}
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {currentStep <= 3 && !recording ? (
              renderStepContent()
            ) : (
              <div className="recording-interface">
                {renderStepContent()}
                
                {/* Recording previews */}
                <div className="row mt-4">
                  {mediaBlob && (
                    <div className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                          <FontAwesomeIcon icon={faUser} className="me-2" />
                          Camera Recording
                        </div>
                        <div className="card-body p-0">
                          <video controls src={URL.createObjectURL(mediaBlob)} className="video-preview w-100" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {screenBlob && (
                    <div className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-header bg-success text-white">
                          <FontAwesomeIcon icon={faDesktop} className="me-2" />
                          Screen Recording
                        </div>
                        <div className="card-body p-0">
                          <video controls src={URL.createObjectURL(screenBlob)} className="video-preview w-100" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {transcription && (
                  <div className="card mb-4">
                    <div className="card-header bg-info text-white">
                      <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                      Transcription
                    </div>
                    <div className="card-body">
                      <pre className="transcription-box p-3">{transcription}</pre>
                    </div>
                  </div>
                )}
              </div>
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
            width: 300,
            height: 200,
          }}
          minWidth={250}
          minHeight={150}
          enableResizing
          className="camera-popup shadow-lg"
        >
          <div className="popup-header bg-dark text-white p-2 d-flex justify-content-between align-items-center">
            <h6 className="m-0">
              <FontAwesomeIcon icon={faVideo} className="me-2" />
             Front Camera
            </h6>
            <div>
              <button 
                className="btn btn-sm btn-outline-light me-2" 
                onClick={toggleMinimize}
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
          onClick={toggleMinimize}
        >
          <FontAwesomeIcon icon={faVideo} className="me" />
        
        </button>
      )}
    </div>
  );
};

export default InterviewPlatform;