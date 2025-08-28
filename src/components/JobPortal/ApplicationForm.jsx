import React, { useState } from 'react';
import { axiosInstance } from '../../axiosUtils';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiUpload, FiCheck, FiChevronRight } from 'react-icons/fi';
import './ApplicationForm.css';

const ApplicationForm = ({ jobId }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setForm({ ...form, resume: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('resume', form.resume);

    try {
      await axiosInstance.post(`/public/apply/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(
        <div className="application-form-toast-success">
          <FiCheck className="application-form-toast-icon" />
          <div>
            <h4>Application Submitted!</h4>
            <p>We'll review your application shortly.</p>
          </div>
        </div>
      );
      setForm({
        name: '',
        email: '',
        phone: '',
        resume: null
      });
    } catch (err) {
      console.error('Application error:', err);
      toast.error(
        <div className="application-form-toast-error">
          <div>
            <h4>Submission Failed</h4>
            <p>{err.response?.data?.error || 'Please try again later'}</p>
          </div>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="application-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="application-form-header">
        <h3>Apply for this Position</h3>
        <p>Complete the form below to submit your application</p>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        <div className="application-form-grid">
          {/* Name Field */}
          <div className={`application-form-group ${isFocused.name || form.name ? 'application-form-focused' : ''}`}>
            <label htmlFor="name">
              <FiUser className="application-form-input-icon" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={() => handleBlur('name')}
              required
            />
            <div className="application-form-focus-border"></div>
          </div>

          {/* Email Field */}
          <div className={`application-form-group ${isFocused.email || form.email ? 'application-form-focused' : ''}`}>
            <label htmlFor="email">
              <FiMail className="application-form-input-icon" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              required
            />
            <div className="application-form-focus-border"></div>
          </div>

          {/* Phone Field */}
          <div className={`application-form-group ${isFocused.phone || form.phone ? 'application-form-focused' : ''}`}>
            <label htmlFor="phone">
              <FiPhone className="application-form-input-icon" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onFocus={() => handleFocus('phone')}
              onBlur={() => handleBlur('phone')}
            />
            <div className="application-form-focus-border"></div>
          </div>

          {/* File Upload */}
          <div className="application-form-group application-form-file-upload-group">
            <label htmlFor="resume">
              <FiUpload className="application-form-input-icon" />
              <span>Upload Resume (PDF, DOC, DOCX)</span>
            </label>
            <div className="application-form-file-upload-wrapper">
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
              />
              <div className="application-form-file-upload-display">
                {form.resume ? (
                  <div className="application-form-file-selected">
                    <FiCheck className="application-form-file-check" />
                    <span>{form.resume.name}</span>
                  </div>
                ) : (
                  <div className="application-form-file-placeholder">
                    <span>Choose a file...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="application-form-footer">
          <motion.button
            type="submit"
            className="application-form-submit-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <div className="application-form-submit-spinner"></div>
            ) : (
              <>
                <span>Submit Application</span>
                <FiChevronRight className="application-form-submit-arrow" />
              </>
            )}
          </motion.button>
          <p className="application-form-note">
            By applying, you agree to our privacy policy and terms of service.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default ApplicationForm;