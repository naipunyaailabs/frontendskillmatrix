import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../axiosUtils';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiDownload, FiMail, FiPhone } from 'react-icons/fi';
import './HRApplications.css';

const HRApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await axiosInstance.get(`/jobportal/myjobs`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('jobToken')}` },
        });
        const job = jobRes.data.jobs.find((j) => j._id === jobId);
        setJobDetails(job);

        const appRes = await axiosInstance.get(`/jobportal/applications/${jobId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('jobToken')}` },
        });
        setApplications(appRes.data);
      } catch (err) {
        toast.error('Failed to load applications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const downloadResume = async (applicationId, resumeKey, candidateName) => {
    try {
      const res = await axiosInstance.get(`/jobportal/view-resume/${applicationId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('jobToken')}` },
      });

      if (res.data?.url) {
        const link = document.createElement('a');
        link.href = res.data.url;
        const fileExt = resumeKey.split('.').pop() || 'pdf';
        link.download = `${candidateName.replace(/\s+/g, '_')}_Resume.${fileExt}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      toast.error('Failed to download resume');
      console.error('Resume download error:', err.response?.data || err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="hr-app-container">
      <div className="header">
        <button onClick={() => navigate('/jobportal/dashboard')} className="back-btn">
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className="title-block">
          <h1>Applications for <span>{jobDetails?.title}</span></h1>
          <p>Total Applications: {applications.length}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="no-app">
          <h3>No Applications Yet</h3>
          <p>As soon as candidates apply, you'll see them here.</p>
        </div>
      ) : (
        <div className="application-grid">
          {applications.map((app) => (
            <div key={app._id} className="app-card">
              <div className="card-top">
                <div className="avatar">{app.candidateName[0].toUpperCase()}</div>
                <div className="info">
                  <h2>{app.candidateName}</h2>
                  <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="contact">
                <p><FiMail /> {app.candidateEmail}</p>
                {app.candidatePhone && <p><FiPhone /> {app.candidatePhone}</p>}
              </div>

              <div className="action">
                <button
                  onClick={() => downloadResume(app._id, app.resumeFile, app.candidateName)}
                  className="download-btn"
                >
                  <FiDownload /> Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HRApplications;
