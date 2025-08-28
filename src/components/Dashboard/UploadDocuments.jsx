import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCloudArrowUp, 
  faFile, 
  faTrash, 
  faTimes,
  faEdit,
  faChevronDown,
  faPlus,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useRef,useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UploadDocuments.css";
import { axiosInstance } from "../../axiosUtils";

function UploadDocuments({ setResponseData }) {
  const navigate = useNavigate();
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobDescFile, setJobDescFile] = useState(null);
  const [jobDescTitle, setJobDescTitle] = useState("");
  const [savedJDs, setSavedJDs] = useState([]);
  const [selectedJD, setSelectedJD] = useState(null);
  const [isJDDropdownOpen, setIsJDDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usageLimits, setUsageLimits] = useState(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [jdToDelete, setJdToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState({
    jds: false,
    content: false,
    delete: false,
    update: false
  });

  // Enhanced loading state management
  const setLoading = (key, value) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  };

  // Fetch user's saved JDs with loading state
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading('jds', true);
        const [usageRes, jdsRes] = await Promise.all([
          axiosInstance.get('/user', { withCredentials: true }),
          axiosInstance.get('/api/job-descriptions', { withCredentials: true })
        ]);
        
        setUsageLimits(usageRes.data.user);
        setSavedJDs(jdsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Failed to load saved JDs');
      } finally {
        setLoading('jds', false);
      }
    };
    
    fetchData();
  }, []);


  // Load JD content when selected with loading state
  useEffect(() => {
    if (!selectedJD) return;

    const loadJDContent = async () => {
      try {
        setLoading('content', true);
        const response = await axiosInstance.get(
          `/api/job-descriptions/${selectedJD._id}/content`,
          { 
            withCredentials: true,
            responseType: 'blob'
          }
        );
        
        const file = new File([response.data], selectedJD.filename, {
          type: 'application/pdf'
        });
        
        setJobDescFile(file);
        setJobDescTitle(selectedJD.title || selectedJD.filename);
      } catch (error) {
        toast.error('Failed to load JD content');
        console.error("Error loading JD:", error);
      } finally {
        setLoading('content', false);
      }
    };

    loadJDContent();
  }, [selectedJD]);

  
  // Confirmation Dialog Component
  const ConfirmationDialog = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title, 
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "delete"
  }) => {
    if (!isOpen) return null;

    return (
      <div className="confirmation-overlay">
        <div className="confirmation-dialog">
          <div className={`confirmation-icon ${type}`}>
            <FontAwesomeIcon 
              icon={type === "delete" ? faExclamationTriangle : faCheckCircle} 
              size="2x" 
            />
          </div>
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
          <div className="confirmation-buttons">
            <button 
              className="confirmation-button cancel"
              onClick={onCancel}
              disabled={isLoading.delete}
            >
              {cancelText}
            </button>
            <button 
              className={`confirmation-button ${type}`}
              onClick={onConfirm}
              disabled={isLoading.delete}
            >
              {isLoading.delete ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Processing...</span>
                </>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteConfirmation = (jd) => {
    setJdToDelete(jd);
    setShowDeleteConfirm(true);
  };
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileUpload = (files) => {
    if (activeModal === "resume") {
      const validFiles = files.filter(
        (file) => file.size <= 25 * 1024 * 1024
      );
      if (validFiles.length !== files.length) {
        alert("Some files exceed the size limit of 25MB and were not added.");
      }
      setResumeFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      const file = files[0];
      if (file.size > 25 * 1024 * 1024) {
        alert("File size should be less than 25MB");
        return;
      }
      setJobDescFile(file);
      setJobDescTitle(file.name.replace('.pdf', ''));
      setSelectedJD(null); // Clear selected JD when uploading new file
    }
    setActiveModal(null);
  };

  const removeFile = (type, index) => {
    if (type === "resume") {
      setResumeFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    } else {
      setJobDescFile(null);
      setJobDescTitle("");
      setSelectedJD(null);
    }
  };

   const handleUpdateTitle = async () => {
    if (!selectedJD || !jobDescTitle.trim()) return;
    
    try {
      setLoading('update', true);
      await axiosInstance.put(
        `/api/job-descriptions/${selectedJD._id}/title`,
        { title: jobDescTitle },
        { withCredentials: true }
      );
      
      setSavedJDs(prev => prev.map(jd => 
        jd._id === selectedJD._id ? { ...jd, title: jobDescTitle } : jd
      ));
      setIsEditingTitle(false);
      toast.success('Title updated successfully');
    } catch (error) {
      toast.error('Failed to update title');
      console.error("Error updating title:", error);
    } finally {
      setLoading('update', false);
    }
  };


const handleDeleteJD = async () => {
    try {
      setLoading('delete', true);
      await axiosInstance.delete(
        `/api/job-descriptions/${jdToDelete._id}`,
        { withCredentials: true }
      );
      
      setSavedJDs(prev => prev.filter(jd => jd._id !== jdToDelete._id));
      if (selectedJD && selectedJD._id === jdToDelete._id) {
        setJobDescFile(null);
        setJobDescTitle("");
        setSelectedJD(null);
      }
      toast.success('JD deleted successfully');
    } catch (error) {
      toast.error('Failed to delete JD');
      console.error("Error deleting JD:", error);
    } finally {
      setLoading('delete', false);
      setShowDeleteConfirm(false);
      setJdToDelete(null);
    }
  };

  const Modal = ({ title, onClose }) => (
    <div className="modal-backdrop" onClick={() => onClose()}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="upload-title">{title}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <p className="upload-subtitle">
          Please upload files in PDF format and make sure the file size is under 25 MB.
        </p>

        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FontAwesomeIcon icon={faCloudArrowUp} className="upload-icon" />
          <p className="drop-text">Drop files or browse</p>
          <p className="format-text">Format: PDF & Max file size: 25 MB</p>
          <label className="browse-button">
            Browse Files
            <input
              type="file"
              className="hidden-input"
              accept=".pdf"
              multiple={activeModal === "resume"}
              onChange={(e) => {
                if (e.target.files.length) {
                  handleFileUpload(Array.from(e.target.files));
                }
              }}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );

  const JDSelector = () => (
    <div className="jd-selector-container">
      <div 
        className={`jd-selector ${isJDDropdownOpen ? 'open' : ''}`}
        onClick={() => setIsJDDropdownOpen(!isJDDropdownOpen)}
      >
        <span className="selector-label">
          {selectedJD ? jobDescTitle : "Select a saved Job Description"}
        </span>
        {isLoading.content ? (
          <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
        ) : (
          <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
        )}
      </div>
      
      {isJDDropdownOpen && (
        <div className="jd-dropdown">
          {isLoading.jds ? (
            <div className="loading-jds">
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Loading JDs...</span>
            </div>
          ) : savedJDs.length > 0 ? (
            savedJDs.map(jd => (
              <div 
                key={jd._id} 
                className={`jd-option ${selectedJD?._id === jd._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedJD(jd);
                  setIsJDDropdownOpen(false);
                }}
              >
                <span className="jd-option-title">{jd.title || jd.filename}</span>
                <span className="jd-option-date">
                  {new Date(jd.uploadedAt).toLocaleDateString()}
                </span>
                <button 
                  className="jd-delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConfirmation(jd);
                  }}
                  disabled={isLoading.delete}
                >
                  {isLoading.delete && jdToDelete?._id === jd._id ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faTrash} />
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="jd-option empty">
              No saved Job Descriptions found
            </div>
          )}
        </div>
      )}
    </div>
  );

const UploadSection = ({ title, files, file, type }) => {
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  return (

  
    <div className="upload-section">
      <div className="upload-card">
        <h3 className="section-title">{title}</h3>
           {type === "jobDesc" && <JDSelector />}
        {type === "resume" && files.length === 0 ? (
          <div className="upload-placeholder" onClick={() => setActiveModal(type)}>
            <FontAwesomeIcon icon={faCloudArrowUp} className="placeholder-icon" />
            <p>No files uploaded yet!</p>
            <button className="upload-button">Upload</button>
            <p className="format-hint">Format: PDF & Max file size: 25 MB</p>
          </div>
        ) : type === "resume" ? (
          files.map((file, index) => (
            <div key={index} className="file-preview">
              <div className="file-info">
                <FontAwesomeIcon icon={faFile} className="file-icon" />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button className="remove-button" onClick={() => removeFile(type, index)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))
        ) : !file ? (
          <div className="upload-placeholder" onClick={() => setActiveModal(type)}>
            <FontAwesomeIcon icon={faCloudArrowUp} className="placeholder-icon" />
            <p>No files uploaded yet!</p>
            <button className="upload-button">Upload</button>
            <p className="format-hint">Format: PDF & Max file size: 25 MB</p>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-info">
              <FontAwesomeIcon icon={faFile} className="file-icon" />
              <div>
                {isEditingTitle ? (
                  <div className="title-edit-container">
                   <input
                      type="text"
                      ref={titleInputRef}
                      value={jobDescTitle}
                      onChange={(e) => setJobDescTitle(e.target.value)}
                      className="title-edit-input"
                      placeholder="Enter JD title"
                    />

                    <button 
                      className="title-save-button"
                      onClick={handleUpdateTitle}
                      disabled={isLoading.update}
                    >
                      {isLoading.update ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Saving...</span>
                        </>
                      ) : 'Save'}
                    </button>
                    <button 
                      className="title-cancel-button"
                      onClick={() => setIsEditingTitle(false)}
                      disabled={isLoading.update}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="title-display-container">
                    <p className="file-name">{jobDescTitle}</p>
                    {selectedJD && (
                      <button 
                        className="edit-title-button"
                        onClick={() => setIsEditingTitle(true)}
                        disabled={isLoading.update}
                      >
                        {isLoading.update ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faEdit} />
                        )}
                      </button>
                    )}
                  </div>
                )}
                <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button className="remove-button" onClick={() => removeFile(type)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
  const handleSubmit = async () => {
    try {
      if (!usageLimits) {
        toast.error('Unable to verify your subscription status. Please try again.');
        return;
      }

      if (resumeFiles.length === 0) {
        toast.error('Please upload at least one resume');
        return;
      }

      if (!jobDescFile) {
        toast.error('Please upload a job description');
        return;
      }

      if (!usageLimits.isAdmin && usageLimits.subscription?.limits) {
        const remainingResumes = usageLimits.subscription.limits.resumeUploads - (usageLimits.usage?.resumeUploads || 0);
        if (resumeFiles.length > remainingResumes) {
          toast.error(`You can only upload ${remainingResumes} more resumes with your current plan`);
          return;
        }

        if ((usageLimits.usage?.jdUploads || 0) >= usageLimits.subscription.limits.jdUploads) {
          toast.error('You have reached your job description upload limit');
          return;
        }
      }

      setIsSubmitting(true);
      
      const formData = new FormData();
      resumeFiles.forEach((file) => formData.append("resumes", file));
      formData.append("job_description", jobDescFile);
      
      if (jobDescTitle && !selectedJD) {
        formData.append("job_description_title", jobDescTitle);
      }

      const response = await axiosInstance.post(
        "/api/submit",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success('Files uploaded successfully!');
      setResponseData({
        results: response.data?.results || [],
        duplicateCount: response.data?.duplicateCount || 0,
      });
  navigate("/dashboard/response", { state: { fromUpload: true } });

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error submitting files';
      toast.error(errorMessage);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

 
  return (
    <div className="upload-container">
      <UploadSection title="Upload Resumes" files={resumeFiles} type="resume" />
      
      <div className="jd-management-section">
 
        <UploadSection title="Upload Job Description" file={jobDescFile} type="jobDesc" />
      </div>

      <div className="submit-button-container">
        <button
          className={`submit-button ${isSubmitting ? "submitting" : ""}`}
          onClick={handleSubmit}
          disabled={isSubmitting || resumeFiles.length === 0 || !jobDescFile}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Submitting...</span>
            </>
          ) : "Submit Files"}
        </button>
      </div>

      {activeModal && (
        <Modal
          title={activeModal === "resume" ? "Upload Resumes" : "Upload Job Description"}
          onClose={() => setActiveModal(null)}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteJD}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setJdToDelete(null);
        }}
        title="Confirm Deletion"
        message="Are you sure you want to delete this Job Description? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default UploadDocuments;