import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../axiosUtils';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './ResetPassword.css'; // 👈 We'll add styles here

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      navigate('/forgot-password');
      return;
    }

    setToken(tokenParam);
    setEmail(decodeURIComponent(emailParam));
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/api/reset-password', {
        token,
        email,
        password,
        confirmPassword
      });

      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container d-flex justify-content-center align-items-center">
      <div className="reset-card p-4 shadow-lg">
        <h2 className="text-center mb-3">🔐 Reset Your Password</h2>
        <p className="text-center text-muted mb-4">for <strong>{email}</strong></p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group position-relative mb-4">
            <label htmlFor="password" className="form-label">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control elegant-input"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="form-group position-relative mb-4">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control elegant-input"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="6"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 rounded-pill py-2"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
