import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiArrowRight, FiArrowLeft, FiUpload, FiCheck,FiX  } from 'react-icons/fi';
import { axiosInstance } from '../../axiosUtils';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import JobPreviewCard from './JobPreviewCard';
import SuccessModal from './SuccessModal';
import './JobPostForm.css';

const JobPostForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    companyName: '', // NEW FIELD
    location: '',
    type: 'Full-Time',
    experience: '',
    department: '',
    skills: '',
    salary: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobTitles = [
    "AI Engineer", "Machine Learning Engineer", "Data Scientist",
    "DevOps Engineer", "Full Stack Developer", "Backend Developer",
    "Software Engineer", "Product Manager", "Business Analyst",
    "UiPath Developer", "Data Analyst", "Python Developer","Data Engineer"
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const isValid = () => form.title && form.location && form.description;

  const next = () => {
    if (!isValid()) {
      toast.warn('Please complete all required fields');
      return;
    }
    setStep(2);
  };

  const back = () => setStep(1);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    Object.entries({
      title: form.title,
      companyName: form.companyName || 'Your Company', // Default value if not provided
      location: form.location,
      experience: form.experience || '0-1 years',
      jobType: form.type,
      department: form.department || 'General',
      skillsRequired: form.skills,
      salaryRange: form.salary || 'Negotiable',
      descriptionText: form.description
    }).forEach(([key, val]) => formData.append(key, val));

    if (file) {
      const ts = Date.now();
      const ext = file.name.split('.').pop();
      const name = form.title.replace(/\s+/g, '_').toLowerCase();
      formData.append('jobDescription', file, `${name}_${ts}.${ext}`);
    }

    try {
      const token = sessionStorage.getItem('jobToken');
      const postRes = await axiosInstance.post('/jobportal/post', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}` 
        }
      });

      if (postRes.status === 201) {
        const urlRes = await axiosInstance.post(
          `/jobportal/generate-public-url/${postRes.data.jobId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGeneratedUrl(urlRes.data.publicUrl);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Job posting error:', err);
      toast.error(
        <div>
          <div style={{ fontWeight: 600 }}>Job Posting Failed</div>
          <div style={{ fontSize: '0.85rem' }}>
            {err.response?.data?.message || 'Please try again later'}
          </div>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('jobToken');
    toast.info('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="job-post-form-container">
      <div className="job-post-form-wrapper">
        <div className="job-post-form-header">
          <div className="job-post-form-header-content">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 ? 'Create Job Posting' : 'Review & Submit'}
            </motion.h2>
            <p className="job-post-form-subtitle">
              {step === 1 ? 'Fill in the job details' : 'Preview before final submission'}
            </p>
          </div>
          <motion.button
            className="job-post-form-logout-button"
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogOut className="job-post-form-logout-icon" />
            <span>Logout</span>
          </motion.button>
        </div>

        <div className="job-post-form-stepper">
          <div className={`job-post-form-stepper-step ${step === 1 ? 'active' : ''}`}>
            <div className="job-post-form-step-number">1</div>
            <div className="job-post-form-step-label">Job Details</div>
          </div>
          <div className="job-post-form-stepper-line"></div>
          <div className={`job-post-form-stepper-step ${step === 2 ? 'active' : ''}`}>
            <div className="job-post-form-step-number">2</div>
            <div className="job-post-form-step-label">Preview</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="job-post-form-step"
              >
                <div className="job-post-form-grid">
                  <div className="job-post-form-group">
                    <label htmlFor="title" className="job-post-form-label">Job Title*</label>
                    <select
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="job-post-form-select"
                      required
                    >
                      <option value="">Select a job title</option>
                      {jobTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="job-post-form-group">
                    <label htmlFor="location" className="job-post-form-label">Location*</label>
                    <input
                      id="location"
                      name="location"
                      placeholder="e.g. New York, Remote"
                      value={form.location}
                      onChange={handleChange}
                      className="job-post-form-input"
                      required
                    />
                  </div>
                   <div className="job-post-form-group">
  <label htmlFor="companyName" className="job-post-form-label">Company Name</label>
  <input
    id="companyName"
    name="companyName"  // Changed from CompanyName to companyName
    placeholder="e.g Cognitbotz solutions"
    value={form.companyName}  // Also update state reference
    onChange={handleChange}
    className="job-post-form-input"
  />
</div>

                  <div className="job-post-form-group">
                    <label htmlFor="type" className="job-post-form-label">Job Type</label>
                    <select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="job-post-form-select"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="job-post-form-group">
                    <label htmlFor="experience" className="job-post-form-label">Experience Level</label>
                    <input
                      id="experience"
                      name="experience"
                      placeholder="e.g. 2-5 years"
                      value={form.experience}
                      onChange={handleChange}
                      className="job-post-form-input"
                    />
                  </div>

                  <div className="job-post-form-group">
                    <label htmlFor="department" className="job-post-form-label">Department</label>
                    <input
                      id="department"
                      name="department"
                      placeholder="e.g. Engineering, Marketing"
                      value={form.department}
                      onChange={handleChange}
                      className="job-post-form-input"
                    />
                  </div>

                  <div className="job-post-form-group">
                    <label htmlFor="skills" className="job-post-form-label">Required Skills</label>
                    <input
                      id="skills"
                      name="skills"
                      placeholder="Comma separated (e.g. React, Node.js)"
                      value={form.skills}
                      onChange={handleChange}
                      className="job-post-form-input"
                    />
                  </div>

                  <div className="job-post-form-group">
                    <label htmlFor="salary" className="job-post-form-label">Salary Range</label>
                    <input
                      id="salary"
                      name="salary"
                      placeholder="e.g. ₹6,00,000 - ₹12,00,000 per year"
                      value={form.salary}
                      onChange={handleChange}
                      className="job-post-form-input"
                    />
                  </div>

                  <div className="job-post-form-group job-post-form-group-full-width">
                    <label htmlFor="description" className="job-post-form-label">Job Description*</label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Detailed description of the job..."
                      value={form.description}
                      onChange={handleChange}
                      className="job-post-form-textarea"
                      required
                    />
                  </div>

                  <div className="job-post-form-group job-post-form-group-full-width">
                    <label htmlFor="file" className="job-post-form-label">Job Description File (Optional)</label>
                    <div className="job-post-form-file-upload">
                      <label htmlFor="file" className="job-post-form-file-label">
                        <FiUpload className="job-post-form-upload-icon" />
                        <span>{fileName || 'Choose a file (PDF, DOCX)'}</span>
                        {fileName && <FiCheck className="job-post-form-check-icon" />}
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFile}
                        accept=".pdf,.docx"
                      />
                    </div>
                  </div>
                </div>

                <div className="job-post-form-actions">
                  <motion.button
                    type="button"
                    onClick={next}
                    className="job-post-form-next-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!isValid()}
                  >
                    <span>Continue</span>
                    <FiArrowRight className="job-post-form-arrow-icon" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="job-post-form-step"
              >
                <div className="job-post-form-preview-container">
                  <JobPreviewCard data={form} />
                </div>

                <div className="job-post-form-actions">
                  <motion.button
                    type="button"
                    onClick={back}
                    className="job-post-form-back-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiArrowLeft className="job-post-form-arrow-icon" />
                    <span>Back</span>
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="job-post-form-submit-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="job-post-form-spinner"></span>
                    ) : (
                      <span>Post Job</span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <AnimatePresence>
        {showModal && (
          <SuccessModal 
            publicUrl={generatedUrl}
            onClose={() => navigate('/jobportal/dashboard')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobPostForm;