import React, { useState } from 'react';
import { axiosInstance } from '../../axiosUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const JobPortalRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/jobportal/register', form);
      toast.success(res.data.message);
      navigate('/jobportal/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5 p-4" style={{ maxWidth: '500px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 className="mb-4 text-center text-success">🏢 Register Your Company</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" className="form-control mb-3" placeholder="Full Name" required onChange={handleChange} />
        <input type="email" name="email" className="form-control mb-3" placeholder="Company Email" required onChange={handleChange} />
        <input type="password" name="password" className="form-control mb-3" placeholder="Password" required onChange={handleChange} />
        <input type="text" name="companyName" className="form-control mb-4" placeholder="Company Name" required onChange={handleChange} />
        <button type="submit" className="btn btn-success w-100">Register</button>
      </form>
    </div>
  );
};

export default JobPortalRegister;
