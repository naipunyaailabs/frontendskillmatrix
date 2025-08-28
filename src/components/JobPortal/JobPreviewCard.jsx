import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaUserTie, 
  FaCode, 
  FaMoneyBillWave, 
  FaFileAlt,
  FaBuilding,
  FaClock,
  FaLayerGroup
} from 'react-icons/fa';
import './JobPreviewCard.css';

const JobPreviewCard = ({ data, className }) => {
  if (!data.title) return null;

  const skillsArray = data.skills ? data.skills.split(',').map(skill => skill.trim()) : [];

  return (
    <motion.div 
      className={`preview-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="preview-header">
        <h4>
          <span className="emoji">📋</span> Job Preview
          <span className="live-badge">Live Preview</span>
        </h4>
      </div>
      
      <div className="preview-body">
        {/* Company Name Section - More prominent */}
        <div className="company-section">
          <FaBuilding className="company-icon" />
          <span className="company-name">{data.companyName || 'Our Company'}</span>
        </div>

        <div className="job-meta">
          <div className="meta-item">
            <FaBriefcase className="meta-icon" />
            <span>{data.type || 'Full-Time'}</span>
          </div>
          <div className="meta-item">
            <FaMapMarkerAlt className="meta-icon" />
            <span>{data.location || 'Remote'}</span>
          </div>
        </div>

        <div className="job-details">
          <h3 className="job-title">{data.title}</h3>
          
          {/* Salary - More prominent */}
          {data.salary && (
            <div className="detail-item highlight">
              <FaMoneyBillWave className="detail-icon" />
              <div className="detail-text">
                <strong>Salary Range:</strong> {data.salary}
              </div>
            </div>
          )}
          
          {/* Experience */}
          {data.experience && (
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <div className="detail-text">
                <strong>Experience Required:</strong> {data.experience}
              </div>
            </div>
          )}
          
          {/* Department */}
          {data.department && (
            <div className="detail-item">
              <FaLayerGroup className="detail-icon" />
              <div className="detail-text">
                <strong>Department:</strong> {data.department}
              </div>
            </div>
          )}

          {/* Skills */}
          {skillsArray.length > 0 && (
            <div className="skills-section">
              <div className="skills-header">
                <FaCode className="skills-icon" />
                <strong>Required Skills:</strong>
              </div>
              <div className="skills-tags">
                {skillsArray.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {data.description && (
            <div className="description-section">
              <div className="description-header">
                <FaFileAlt className="description-icon" />
                <strong>Job Description:</strong>
              </div>
              <p className="description-text">{data.description}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobPreviewCard;