import React, { useState } from 'react';
import { axiosInstance } from '../../axiosUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const JobPortalLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/jobportal/login', { email, password });
      sessionStorage.setItem('jobToken', res.data.token);
      toast.success('Login successful');
    navigate('/jobportal/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5 p-4" style={{ maxWidth: '500px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 className="mb-4 text-center text-primary">🔐 Company Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" className="form-control mb-3" placeholder="Company Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="form-control mb-4" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
};

export default JobPortalLogin;
