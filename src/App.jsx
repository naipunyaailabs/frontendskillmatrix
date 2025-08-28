import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AssessmentPlatform from './components/TestPlatform/AssessmentPlatform';
import InterviewPlatform from './components/TestPlatform/InterviewPlatform';
import Quiz from './components/TestPlatform/Quiz';
import LandingLayout from './components/Layouts/LandingLayout';
import { ToastContainer } from 'react-toastify';

import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

import JobPortalLogin from './components/JobPortal/JobPortalLogin';
import JobPortalRegister from './components/JobPortal/JobPortalRegister';
import JobPostForm from './components/JobPortal/JobPostForm';
import JobPortalProtectedRoute from './components/JobPortal/JobPortalProtectedRoute';
import JobPortalEntry from './components/JobPortal/JobPortalEntry';
import JobPosterDashboard from './components/JobPortal/JobPosterDashboard';
import HRApplications from './components/JobPortal/HRApplications';
import PublicJobView from './components/JobPortal/PublicJobView';


import './App.css';
import './styles.css';

function App() {
  return (
    <Router>
  <ToastContainer position="top-center" />
      <Routes>

        {/* Landing Routes (with Navbar + Footer) */}
        <Route
          path="/"
          element={
            <LandingLayout>
              <LandingPage />
            </LandingLayout>
          }
        />
        <Route
          path="/login"
          element={
            <LandingLayout>
              <Login />
            </LandingLayout>
          }
        />
        <Route
          path="/register"
          element={
            <LandingLayout>
              <Register />
            </LandingLayout>
          }
        />
<Route
  path="/jobportal"
  element={
    <LandingLayout>
      <JobPortalEntry />
    </LandingLayout>
  }
/>

<Route
  path="/jobportal/login"
  element={
    <LandingLayout>
      <JobPortalLogin />
    </LandingLayout>
  }
/>
<Route
  path="/jobportal/register"
  element={
    <LandingLayout>
      <JobPortalRegister />
    </LandingLayout>
  }
/>

<Route path="/jobportal/dashboard" element={
  <JobPortalProtectedRoute>
    <JobPosterDashboard />
  </JobPortalProtectedRoute>
} />



<Route
  path="/jobportal/post"
  element={
    <JobPortalProtectedRoute>
      <JobPostForm />
    </JobPortalProtectedRoute>
  }
/>

<Route 
  path="/jobportal/applications/:jobId" 
  element={
    <JobPortalProtectedRoute>
      <HRApplications />
    </JobPortalProtectedRoute>
  } 
/>
    <Route path="/jobs/:publicId" element={<PublicJobView />} />

        <Route
          path="/forgot-password"
          element={
            <LandingLayout>
              <ForgotPassword />
            </LandingLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <LandingLayout>
              <ResetPassword />
            </LandingLayout>
          }
        />

        {/* Dashboard & Internal Routes (no navbar/footer) */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
       <Route path="/assessment/:token" element={<AssessmentPlatform />} />
        <Route path="/interview/*" element={<InterviewPlatform />} />
        <Route path="/quiz/:token" element={<Quiz proctored={false} />} />
      </Routes>
    </Router>
  );
}

export default App;
