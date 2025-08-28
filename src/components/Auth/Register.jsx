import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { axiosInstance } from "../../axiosUtils";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Install with: npm install react-icons
import smily from "../../assets/smily.gif";
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    companyName: '',
    designation: '',
  });

  const [loading, setLoading] = useState(false);
     const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post('/register', formData);
      toast.success(res.data.message);
      setShowModal(true); // Show modal after successful registration
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/login'); // Navigate after user closes modal
  };

  return (
    <div className="container">
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
          <div className="text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2 fw-semibold text-dark">Registering, please wait...</div>
          </div>
        </div>
      )}

<Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
  <Modal.Body className="text-center p-4">
    <img
        src={smily}
      alt="Verify Email"
      className="img-fluid mb-3"
      style={{ maxHeight: '200px' }}
    />
    <h5 className="fw-bold text-primary">Verify Your Email 📩</h5>
    <p className="text-muted">We sent a verification link to your email.</p>
    <p className="text-muted">
      Check your <strong>Inbox</strong>, <strong>Spam</strong>, or <strong>Junk</strong> folders to complete the setup.
    </p>
    <Button variant="primary" onClick={handleCloseModal} className="mt-2 px-4">
      Got it!
    </Button>
  </Modal.Body>
</Modal>


      <div className="auth-form bg-white">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Apply for your Free Trial</h2>
          <p className="text-muted">No credit card required</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control bg-white bg-opacity-50"
                id="name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control bg-white bg-opacity-50"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Company Email"
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
        name="password"
        placeholder="Enter Password"
        value={formData.password}
        onChange={handleChange}
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
          color: "#6c757d",
        }}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>

            <div className="mb-3">
              <label className="form-label">Mobile Number</label>
              <input
                className="form-control bg-white bg-opacity-50"
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control bg-white bg-opacity-50"
                name="companyName"
                placeholder="Enter Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Designation/Job Title</label>
              <input
                type="text"
                className="form-control bg-white bg-opacity-50"
                name="designation"
                placeholder="Enter Your Designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/login" className="text-decoration-none">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
