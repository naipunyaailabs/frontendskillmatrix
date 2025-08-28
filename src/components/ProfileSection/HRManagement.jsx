import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../axiosUtils';
import { toast } from 'react-toastify';
import { 
  FiDownload, FiMail, FiPhone, FiUser, FiBriefcase, 
  FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiLink2,
  FiChevronRight, FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { FaRupeeSign,FaBuilding  } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import './HRManagement.css';

const HRManagement = () => {
  const [hrUsers, setHrUsers] = useState([]);
  const [selectedHr, setSelectedHr] = useState(null);
  const [jobPosts, setJobPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('hrUsers');
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    fetchHrUsers();
  }, []);

  const fetchHrUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/jobposters', { withCredentials: true });
      setHrUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch HR users');
    } finally {
      setLoading(false);
    }
  };

  const fetchHrData = async (hrId) => {
    try {
      setLoading(true);
      const jobsRes = await axiosInstance.get(`/jobportal/admin/jobs/${hrId}`, { withCredentials: true });
      setJobPosts(jobsRes.data);
      
      const apps = [];
      for (const job of jobsRes.data) {
        const appsRes = await axiosInstance.get(`/jobportal/admin/applications/${job._id}`, { withCredentials: true });
        apps.push(...appsRes.data.map(app => ({ ...app, jobTitle: job.title, jobId: job._id })));
      }
      setApplications(apps);
      setSelectedHr(hrId);
      setActiveTab('jobs');
    } catch (err) {
      toast.error('Failed to fetch HR data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJD = async (jobId) => {
    try {
      const res = await axiosInstance.get(`/jobportal/view-jd/${jobId}`, { withCredentials: true });
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error('Could not retrieve job description file');
      }
    } catch (err) {
      toast.error('Error opening job description file');
    }
  };

  const handleViewResume = async (applicationId, candidateName) => {
    try {
      const res = await axiosInstance.get(`/jobportal/view-resume/${applicationId}`, {
        withCredentials: true,
      });

      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error('Could not retrieve resume file');
      }
    } catch (err) {
      toast.error('Failed to open resume');
    }
  };

  const toggleJobExpansion = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const openApplicationDetails = (app) => {
    setSelectedApplication(app);
  };

  const closeModal = () => {
    setSelectedApplication(null);
  };

  const filteredHrUsers = hrUsers.filter(hr => {
    const name = hr?.name || '';
    const email = hr?.email || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) || 
           email.toLowerCase().includes(searchLower);
  });

  const filteredJobs = jobPosts.filter(job => {
    const title = job?.title || '';
    const location = job?.location || '';
    const searchLower = searchTerm.toLowerCase();
    return title.toLowerCase().includes(searchLower) || 
           location.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-80">
        <div className="spinner-grow text-primary" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid hr-management-container px-4 py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient-primary mb-1">HR Management Dashboard</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#">Admin</a></li>
              <li className="breadcrumb-item active" aria-current="page">HR Management</li>
            </ol>
          </nav>
        </div>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="form-control search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card stat-card stat-card-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Total HR Users</h6>
                  <h3 className="mb-0">{hrUsers.length}</h3>
                </div>
                <div className="icon-circle bg-primary-light">
                  <FiUser className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card stat-card-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Total Jobs Posted</h6>
                  <h3 className="mb-0">{jobPosts.length}</h3>
                </div>
                <div className="icon-circle bg-success-light">
                  <FiBriefcase className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card stat-card-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Total Applications</h6>
                  <h3 className="mb-0">{applications.length}</h3>
                </div>
                <div className="icon-circle bg-info-light">
                  <FiUsers className="text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 pt-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'hrUsers' ? 'active' : ''}`}
                onClick={() => setActiveTab('hrUsers')}
              >
                <FiUser className="me-2" /> HR Users
              </button>
            </li>
            {selectedHr && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <FiBriefcase className="me-2" /> Jobs & Applications
                </button>
              </li>
            )}
          </ul>
        </div>
        
        <div className="card-body">
          {/* HR Users Tab */}
          {activeTab === 'hrUsers' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>HR Manager</th>
                    <th>Contact</th>
                    <th>Jobs Posted</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHrUsers.map(hr => (
                    <tr key={hr._id} className="cursor-pointer">
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-sm bg-primary-light text-primary rounded-circle me-3">
                            {(hr.name || '').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h6 className="mb-0">{hr.name}</h6>
                            <small className="text-muted">ID: {hr._id.substring(0, 8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted">{hr.email}</div>
                        {hr.phone && <div className="text-muted small">{hr.phone}</div>}
                      </td>
                      <td>
                        <span className="badge bg-primary-light text-primary">
                          {hr.jobCount || 0} Jobs
                        </span>
                      </td>
                      <td>
                        {hr.lastActive ? new Date(hr.lastActive).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <button
                          onClick={() => fetchHrData(hr._id)}
                          className="btn btn-sm btn-outline-primary rounded-pill"
                        >
                          View Details <FiChevronRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Jobs & Applications Tab */}
          {activeTab === 'jobs' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  Jobs Posted by {hrUsers.find(u => u._id === selectedHr)?.name}
                </h5>
                <div className="d-flex">
                  <div className="dropdown me-2">
                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <FiFilter className="me-1" /> Filter
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="filterDropdown">
                      <li><a className="dropdown-item" href="#">All Jobs</a></li>
                      <li><a className="dropdown-item" href="#">Active</a></li>
                      <li><a className="dropdown-item" href="#">Closed</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="jobs-list">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <div key={job._id} className="job-card-container mb-4">
                      <div 
                        className="card job-card hover-shadow-sm"
                        onClick={() => toggleJobExpansion(job._id)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">{job.title}</h5>
                                            {job.companyName && (
                              <div className="company-name-badge mt-1">
                                <FaBuilding className="me-1" />
                                <span>{job.companyName}</span>
                              </div>
                            )}
                            <div className="d-flex align-items-center">
                              <span className="badge bg-success-light text-success me-2">Active</span>
                              <span className="text-muted">
                                {expandedJobId === job._id ? (
                                  <FiChevronUp className="ms-2" />
                                ) : (
                                  <FiChevronDown className="ms-2" />
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center text-muted mb-2">
                            <FiMapPin className="me-2 flex-shrink-0" />
                            <span className="text-truncate">{job.location}</span>
                          </div>
                          <div className="d-flex align-items-center text-muted mb-3">
                            <FaRupeeSign className="me-2 flex-shrink-0" />
                            <span>{job.salaryRange}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div>
                              <span className="badge bg-primary-light text-primary">
                                <FiUsers className="me-1" /> {applications.filter(app => app.jobId === job._id).length} applications
                              </span>
                            </div>
                            <div className="text-muted small">
                              <FiCalendar className="me-1" /> Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Both Job Details and Applications */}
                  {expandedJobId === job._id && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    className="expanded-content mt-2"
  >
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Job Details</h6>
        <span className="badge bg-success text-white">Active</span>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Job Details Row 1 */}
          <div className="col-md-4">
            <div className="detail-item">
              <div className="detail-icon">
                <FiMapPin />
              </div>
              <div>
                <h6 className="detail-label">Location</h6>
                <p className="detail-value">{job.location || 'Not specified'}</p>
              </div>
            </div>
          </div>
          {/* Inside the expanded job details section */}
<div className="col-md-4">
  <div className="detail-item">
    <div className="detail-icon">
      <FaBuilding />
    </div>
    <div>
      <h6 className="detail-label">Company</h6>
      <p className="detail-value">{job.companyName || 'Not specified'}</p>
    </div>
  </div>
</div>
          <div className="col-md-4">
            <div className="detail-item">
              <div className="detail-icon">
                <FiBriefcase />
              </div>
              <div>
                <h6 className="detail-label">Job Type</h6>
                <p className="detail-value">{job.jobType || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="detail-item">
              <div className="detail-icon">
                <FiUser />
              </div>
              <div>
                <h6 className="detail-label">Experience</h6>
                <p className="detail-value">{job.experience || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {/* Job Details Row 2 */}
          <div className="col-md-4">
            <div className="detail-item">
              <div className="detail-icon">
                <FaRupeeSign />
              </div>
              <div>
                <h6 className="detail-label">Salary Range</h6>
                <p className="detail-value">{job.salaryRange || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="detail-item">
              <div className="detail-icon">
                <FiCalendar />
              </div>
              <div>
                <h6 className="detail-label">Posted</h6>
                <p className="detail-value">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-4">
          <h6 className="section-title">Job Description</h6>
          <div className="description-box">
            <p>{job.descriptionText || 'No description provided'}</p>
          </div>
          {job.jobDescriptionFile && (
            <button
              onClick={() => handleViewJD(job._id)}
              className="btn btn-outline-primary mt-2"
            >
              <FiDownload className="me-2" /> View Job Description File
            </button>
          )}
        </div>

        {/* Required Skills */}
        {job.skillsRequired?.length > 0 && (
          <div className="mt-4">
            <h6 className="section-title">Required Skills</h6>
            <div className="skills-container">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Job */}
        {job.publicId && (
          <div className="mt-4">
            <h6 className="section-title">Share This Job</h6>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={`${window.location.origin}/jobs/${job.publicId}`}
                readOnly
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.publicId}`);
                  toast.success('Link copied to clipboard!');
                }}
                className="btn btn-primary"
              >
                <FiLink2 className="me-1" /> Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

                          <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                              <h6 className="mb-0">Applications for this job</h6>
                            </div>
                            <div className="card-body p-0">
                   {applications.filter(app => app.jobId === job._id).length > 0 ? (
  <div className="applications-grid">
    {applications
      .filter(app => app.jobId === job._id)
      .map(app => (
        <div key={app._id} className="application-card">
          <div className="application-header">
            <div className="candidate-avatar">
              {app.candidateName.charAt(0).toUpperCase()}
            </div>
            <div className="candidate-info">
              <h6>{app.candidateName}</h6>
              <small className="text-muted">{app.candidateEmail}</small>
            </div>
            <span className="application-status badge bg-warning">New</span>
          </div>
          
          <div className="application-details">
            <div className="detail-item">
              <FiCalendar className="icon-sm" />
              <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
            </div>
            {app.candidatePhone && (
              <div className="detail-item">
                <FiPhone className="icon-sm" />
                <span>{app.candidatePhone}</span>
              </div>
            )}
          </div>
          
          <div className="application-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openApplicationDetails(app);
              }}
              className="btn btn-outline-primary btn-sm"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewResume(app._id, app.candidateName);
              }}
              className="btn btn-outline-success btn-sm"
            >
              <FiDownload className="me-1" /> Resume
            </button>
          </div>
        </div>
      ))}
  </div>
) : (
  <div className="empty-state py-3">
    <div className="empty-state-icon">
      <FiUsers />
    </div>
    <h6>No applications yet</h6>
    <p className="text-muted small">This job hasn't received any applications yet.</p>
  </div>
)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FiBriefcase />
                      </div>
                      <h5>No jobs found</h5>
                      <p className="text-muted">This HR manager hasn't posted any jobs yet.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Application Details Modal - Improved Design */}
   {/* Application Details Modal - Premium Redesign */}
<AnimatePresence>
  {selectedApplication && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop show d-flex align-items-center justify-content-center"
      onClick={closeModal}
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0" style={{ 
          maxWidth: '650px', 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}>
          {/* Modern Header with Gradient */}
          <div className="modal-header" style={{
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
            padding: '1.5rem',
            borderBottom: 'none'
          }}>
            <div className="d-flex align-items-center w-100">
              <div className="avatar avatar-lg me-3" style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px'
              }}>
                {selectedApplication.candidateName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow-1">
                <h5 className="modal-title mb-0 text-white" style={{ fontSize: '1.4rem' }}>
                  {selectedApplication.candidateName}
                </h5>
                <small className="text-white" style={{ opacity: 0.9 }}>
                  Applied for: <span style={{ fontWeight: '500' }}>{selectedApplication.jobTitle}</span>
                </small>
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={closeModal}
                style={{ filter: 'brightness(0) invert(1)' }}
              ></button>
            </div>
          </div>

          {/* Refined Body Section */}
          <div className="modal-body p-4" style={{ background: '#f8fafc' }}>
            <div className="row g-3 mb-4">
              {/* Email Card - Modern Design */}
              <div className="col-md-6">
                <div className="card h-100 border-0" style={{
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  background: 'white'
                }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        background: '#e6f7ff',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <FiMail className="text-primary" style={{ fontSize: '1.1rem' }} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1" style={{ 
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Email</h6>
                        <p className="mb-0" style={{ 
                          fontWeight: '500',
                          color: '#1e293b'
                        }}>{selectedApplication.candidateEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Card - Matching Style */}
              {selectedApplication.candidatePhone && (
                <div className="col-md-6">
                  <div className="card h-100 border-0" style={{
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    background: 'white'
                  }}>
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center">
                        <div style={{
                          background: '#f0fdf4',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px'
                        }}>
                          <FiPhone className="text-emerald-500" style={{ fontSize: '1.1rem' }} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1" style={{ 
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Phone</h6>
                          <p className="mb-0" style={{ 
                            fontWeight: '500',
                            color: '#1e293b'
                          }}>{selectedApplication.candidatePhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="d-grid gap-3">
              <button
                onClick={() => handleViewResume(selectedApplication._id, selectedApplication.candidateName)}
                className="btn py-2 d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  height: '46px'
                }}
              >
                <FiDownload className="me-2" /> View Resume
              </button>
              <button className="btn py-2 d-flex align-items-center justify-content-center" 
                style={{
                  background: 'white',
                  color: '#3b82f6',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  height: '46px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                <FiMail className="me-2" /> Send Message
              </button>
            </div>
          </div>

          {/* Minimal Footer */}
          <div className="modal-footer border-top-0 p-3" style={{ background: '#f8fafc' }}>
            <button 
              className="btn" 
              onClick={closeModal}
              style={{
                color: '#64748b',
                fontWeight: '500',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.4rem 1.2rem'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default HRManagement;