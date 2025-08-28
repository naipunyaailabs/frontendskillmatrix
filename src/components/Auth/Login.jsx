import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../axiosUtils';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Install with: npm install react-icons
import WelcomeModal from '../modals/WelcomeModal';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 Loading state
    const [showWelcome, setShowWelcome] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 Start loading
    try {
      const res = await axiosInstance.post(
        '/login',
        { email, password },
        { withCredentials: true }
      );
 setLoggedInUserName(res.data.user?.fullName || '');
      setShowWelcome(true); // Show welcome modal
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false); // 👈 Stop loading
    }
  };
 const handleWelcomeClose = () => {
    setShowWelcome(false);
    navigate('/dashboard/upload'); // Move here after welcome
  };

  return (
    <div className="container position-relative">
      {/* 🔄 Overlay Spinner */}
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
          <div className="text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2 fw-semibold text-dark">Logging in, please wait...</div>
          </div>
        </div>
      )}

       <WelcomeModal show={showWelcome} onClose={handleWelcomeClose} userName={loggedInUserName} />

      <div className="auth-form bg-white">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome back</h2>
          <p className="text-muted">Sign in to your SkillMatrix ATS account</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label text-black">Email</label>
              <input
                type="email"
                className="form-control bg-white bg-opacity-50"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          <div className="mb-3 position-relative">
      <label htmlFor="password" className="form-label text-black">
        Password
      </label>

      <input
        type={showPassword ? "text" : "password"}
        className="form-control bg-white bg-opacity-50"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      <span
        onClick={() => setShowPassword(!showPassword)}
        className="position-absolute"
        style={{
          right: "15px",
          top: "38px",
          cursor: "pointer",
          zIndex: 10,
          color: "#6c757d"
        }}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/forgot-password" className="text-black text-decoration-none">
              {/* Add Forgot password text here if needed */}
            </Link>
          </div>

          <div className="mt-3 text-center">
            Don't have an account?{' '}
            <Link to="/Register" className="text-decoration-none">
              Register
            </Link>
          </div>
          <div className="mt-3 text-center">
  <Link to="/forgot-password" className="text-decoration-none">
    Forgot password?
  </Link>
</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
