import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../../axiosUtils';
import ApplicationForm from './ApplicationForm';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaBriefcase, FaBuilding, FaClock, FaMoneyBillWave, FaUserTie, FaFileAlt, FaCode } from 'react-icons/fa';
import './PublicJobView.css';

const PublicJobView = () => {
  const { publicId } = useParams();
  const [job, setJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axiosInstance.get(`/public/job/${publicId}`);
        setJob(res.data);
      } catch (err) {
        toast.error('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [publicId]);

const handleViewJD = () => {
  const newTab = window.open('', '_blank'); // Open a blank tab immediately (Safari requires this)

  axiosInstance.get(`/public/view-jd/${job._id}`)
    .then((res) => {
      if (res.data?.url) {
        newTab.location.href = res.data.url; // Set the PDF file URL
      } else {
        newTab.close();
        toast.error('No job description file found.');
      }
    })
    .catch((err) => {
      newTab.close();
      toast.error('Failed to open job description.');
      console.error(err);
    });
};


  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading job details...</p>
    </div>
  );

  if (!job) return (
    <div className="error-container">
      <h2>Job Not Found</h2>
      <p>The job you're looking for doesn't exist or may have been removed.</p>
    </div>
  );

  return (
    <div className="public-job-container">
      {/* Job Header Section */}
      <div className="job-header">
        <div className="job-title-section">
          <h1>{job.title}</h1>
          <div className="company-info">
            {job.companyName && (
              <div className="company-name">
                <FaBuilding className="icon" />
                <span>{job.companyName}</span>
              </div>
            )}
            {job.postedBy?.name && !job.companyName && (
              <div className="company-name">
                <FaBuilding className="icon" />
                <span>{job.postedBy.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="job-meta-tags">
          <div className="meta-tag">
            <FaMapMarkerAlt className="icon" />
            <span>{job.location}</span>
          </div>
          <div className="meta-tag">
            <FaBriefcase className="icon" />
            <span>{job.jobType}</span>
          </div>
          {job.experience && (
            <div className="meta-tag">
              <FaClock className="icon" />
              <span>{job.experience}</span>
            </div>
          )}
          {job.salaryRange && (
            <div className="meta-tag highlight">
              <FaMoneyBillWave className="icon" />
              <span>{job.salaryRange}</span>
            </div>
          )}
        </div>
      </div>

      {/* Job Content Section */}
      <div className="job-content">
        <div className="job-details">
          {/* Description Section */}
          <section className="job-section">
            <h2>
              <FaFileAlt className="section-icon" />
              Job Description
            </h2>
            <div className="section-content">
              <p>{job.descriptionText}</p>
            </div>
          </section>

          {/* Requirements Section */}
          {job.skillsRequired?.length > 0 && (
            <section className="job-section">
              <h2>
                <FaCode className="section-icon" />
                Requirements
              </h2>
              <div className="section-content">
                <div className="skills-container">
                  {job.skillsRequired.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Additional Details */}
          <section className="job-section">
            <h2>
              <FaUserTie className="section-icon" />
              Additional Details
            </h2>
            <div className="details-grid">
              {job.department && (
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{job.department}</span>
                </div>
              )}
              {job.experience && (
                <div className="detail-item">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{job.experience}</span>
                </div>
              )}
              {job.salaryRange && (
                <div className="detail-item">
                  <span className="detail-label">Salary:</span>
                  <span className="detail-value">{job.salaryRange}</span>
                </div>
              )}
            </div>
          </section>

          {/* Job Description File */}
          {job.jobDescriptionFile && (
            <div className="jd-file-section">
              <button onClick={handleViewJD} className="view-jd-button">
                View Full Job Description PDF
              </button>
            </div>
          )}
        </div>

        {/* Application Section */}
        <div className="application-section">
          {!showForm ? (
            <div className="apply-card">
              <h3>Ready to Apply?</h3>
              <p>Submit your application to be considered for this position.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="apply-button"
              >
                Apply Now
              </button>
              <div className="apply-note">
                <p>Applications are processed within 3-5 business days.</p>
              </div>
            </div>
          ) : (
            <div className="application-form-container">
              <ApplicationForm jobId={job._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicJobView;