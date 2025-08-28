import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../axiosUtils';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './ResetPassword.css'; // 👈 CSS for styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/api/forgot-password', { email });
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container d-flex justify-content-center align-items-center">
      <div className="forgot-card p-4 shadow-lg">
        <h2 className="text-center mb-3">🔑 Forgot Password</h2>
        <p className="text-muted text-center mb-4">We'll send you a reset link</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control elegant-input"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 rounded-pill py-2"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/login')}
          >
            ⬅ Back to Login
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📧 Email Sent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>A reset link has been sent to <strong>{email}</strong>.</p>
          <p>Please check your inbox and follow the instructions.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="dark"
            className="rounded-pill px-4"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/login');
            }}
          >
            Okay
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
