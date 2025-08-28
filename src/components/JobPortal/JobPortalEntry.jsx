import { Link } from 'react-router-dom';
import './JobPortalEntry.css';

const JobPortalEntry = () => {
  return (
    <div className="job-portal-entry-container">
      <div className="glass-card animate__animated animate__fadeInDown">
        <h2 className="headline">🚀 Welcome to SkillMatrix Jobs</h2>
        <p className="subtitle">Only verified companies can post jobs to discover top tech talent.</p>
        
        <div className="button-group">
          <Link to="/jobportal/login" className="btn-modern btn-outline">Login</Link>
          <Link to="/jobportal/register" className="btn-modern btn-filled">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default JobPortalEntry;
