// components/Layouts/LandingLayout.jsx
import Navbar from '../LandingPage/Navbar';
import Footer from '../LandingPage/Footer';
import React from 'react';

const LandingLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

export default LandingLayout;
