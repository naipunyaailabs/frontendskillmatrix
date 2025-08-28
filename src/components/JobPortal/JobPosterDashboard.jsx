import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../axiosUtils';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiUser, 
  FiLogOut, 
  FiBriefcase, 
  FiEye, 
  FiX, 
  FiDownload,
  FiLink,
  FiCopy,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiMapPin
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import './JobPosterDashboard.css';

const JobPosterDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchMyJobs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/jobportal/profile', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('jobToken')}` }
      });
      setProfile(res.data.user);
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await axiosInstance.get('/jobportal/myjobs', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('jobToken')}` }
      });
      setJobs(res.data.jobs);
    } catch (err) {
      toast.error('Failed to load job posts');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jobToken');
    toast.info('Logged out successfully');
    navigate('/');
  };

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setCopied(false);
  };

  const handleViewJD = async (jobId) => {
    try {
      const token = sessionStorage.getItem('jobToken');
      const res = await axiosInstance.get(`/jobportal/view-jd/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error('Could not retrieve job description file');
      }
    } catch (err) {
      toast.error('Error opening job description file');
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  const closeModal = () => setSelectedJob(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">
            Welcome back, <span>{profile.name?.split(' ')[0] || 'Recruiter'}</span>
          </h1>
          <p className="dashboard-subtitle">Manage your job postings and applications</p>
        </div>
        <button 
          className="dashboard-logout-button" 
          onClick={handleLogout}
        >
          <FiLogOut /> Sign Out
        </button>
      </div>

      <div className="dashboard-grid">
        <motion.div 
          className="dashboard-card dashboard-new-job-card"
          whileHover={{ y: -5 }}
          onClick={() => navigate('/jobportal/post')}
        >
          <div className="dashboard-card-content-center">
            <div className="dashboard-card-icon">
              <FiPlus />
            </div>
            <h3>Post New Job</h3>
            <p>Create a new job listing to attract top talent</p>
          </div>
        </motion.div>

        <div className="dashboard-card dashboard-jobs-card">
          <div className="dashboard-card-header">
            <h3><FiBriefcase /> My Job Posts</h3>
            <span className="dashboard-badge">{jobs.length}</span>
          </div>
          <div className="dashboard-job-list">
            {jobs.length === 0 ? (
              <div className="dashboard-empty-state">
                <p>No jobs posted yet</p>
                <button 
                  className="dashboard-primary-button small"
                  onClick={() => navigate('/jobportal/post')}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              jobs.map(job => (
                <div 
                  className="dashboard-job-item" 
                  key={job._id}
                  onClick={() => openJobDetails(job)}
                >
                  <div className="dashboard-job-info">
                    <h4>{job.title}</h4>
                    <div className="dashboard-job-meta">
                      <span><FiCalendar /> {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span><FiUsers /> {job.applications?.length || 0} applicants</span>
                    </div>
                  </div>
                  <FiEye className="dashboard-view-icon" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card dashboard-profile-card">
          <div className="dashboard-card-header">
            <h3><FiUser /> My Profile</h3>
          </div>
          <div className="dashboard-profile-details">
            <div className="dashboard-detail-item">
              <span className="dashboard-detail-label">Name</span>
              <span className="dashboard-detail-value">{profile.name}</span>
            </div>
            <div className="dashboard-detail-item">
              <span className="dashboard-detail-label">Email</span>
              <span className="dashboard-detail-value">{profile.email}</span>
            </div>
            <div className="dashboard-detail-item">
              <span className="dashboard-detail-label">Status</span>
              <span className={`dashboard-status-badge ${profile.isVerified ? 'verified' : 'unverified'}`}>
                {profile.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
  {selectedJob && (
    <motion.div 
      className="dashboard-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div 
        className="dashboard-modal-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="dashboard-modal-header">
          <h2>{selectedJob.title}</h2>
<div className="dashboard-company-name">
  <FiBriefcase className="dashboard-detail-icon" />
  <h6 className="dashboard-company-text">{selectedJob.companyName || "Unknown Company"}</h6>
</div>

          <div className="dashboard-job-status">
            <span className="dashboard-active-badge">Active</span>
            <span className="dashboard-post-date">
              <FiCalendar /> Posted: {new Date(selectedJob.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* ...rest of the component remains the same... */}


              <div className="dashboard-job-details-grid">
                <div className="dashboard-modal-detail-item">
                  <FiMapPin className="dashboard-detail-icon" />
                  <div>
                    <span className="dashboard-modal-detail-label">Location</span>
                    <span className="dashboard-modal-detail-value">{selectedJob.location}</span>
                  </div>
                </div>
                
                <div className="dashboard-modal-detail-item">
                  <FiBriefcase className="dashboard-detail-icon" />
                  <div>
                    <span className="dashboard-modal-detail-label">Job Type</span>
                    <span className="dashboard-modal-detail-value">{selectedJob.jobType}</span>
                  </div>
                </div>
                
                <div className="dashboard-modal-detail-item">
                  <FiUser className="dashboard-detail-icon" />
                  <div>
                    <span className="dashboard-modal-detail-label">Experience</span>
                    <span className="dashboard-modal-detail-value">{selectedJob.experience}</span>
                  </div>
                </div>
                
                <div className="dashboard-modal-detail-item">
                  <FaRupeeSign className="dashboard-detail-icon" />
                  <div>
                    <span className="dashboard-modal-detail-label">Salary Range</span>
                    <span className="dashboard-modal-detail-value">{selectedJob.salaryRange}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h3 className="dashboard-section-title">Job Description</h3>
                <div className="dashboard-section-content">
                  <p>{selectedJob.descriptionText}</p>
                  {selectedJob.jobDescriptionFile && (
                    <button
                      className="dashboard-file-download"
                      onClick={() => handleViewJD(selectedJob._id)}
                    >
                      <FiDownload /> View Job Description File
                    </button>
                  )}
                </div>
              </div>

              {selectedJob.skillsRequired?.length > 0 && (
                <div className="dashboard-section">
                  <h3 className="dashboard-section-title">Required Skills</h3>
                  <div className="dashboard-skills-container">
                    {selectedJob.skillsRequired.map((skill, index) => (
                      <span key={index} className="dashboard-skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.publicId && (
                <div className="dashboard-section dashboard-share-section">
                  <h3 className="dashboard-section-title">Share This Job</h3>
                  <div className="dashboard-share-container">
                    <div className="dashboard-share-input-group">
                      <FiLink className="dashboard-link-icon" />
                      <input
                        type="text"
                        value={`${window.location.origin}/jobs/${selectedJob.publicId}`}
                        readOnly
                        className="dashboard-share-input"
                      />
                      <button 
                        className={`dashboard-copy-button ${copied ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(`${window.location.origin}/jobs/${selectedJob.publicId}`)}
                      >
                        <FiCopy /> {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                    <p className="dashboard-share-hint">
                      Share this link with candidates to apply directly
                    </p>
                  </div>
                </div>
              )}

              {selectedJob.applications?.length > 0 && (
                <div className="dashboard-section dashboard-applications-section">
                  <h3 className="dashboard-section-title">
                    <FiUsers /> Applications ({selectedJob.applications.length})
                  </h3>
                  <button 
                    className="dashboard-view-applications-button"
                    onClick={() => {
                      navigate(`/jobportal/applications/${selectedJob._id}`);
                      closeModal();
                    }}
                  >
                    View All Applications
                  </button>
                </div>
              )}

              <div className="dashboard-modal-actions">
                <button className="dashboard-secondary-button" onClick={closeModal}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobPosterDashboard;