import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiBarChart2, FiClock, FiVideo, FiMessageSquare,
  FiFileText, FiUserCheck, FiAward, FiSearch, FiUpload, FiCheckCircle
} from 'react-icons/fi';

import './LandingPage.css';

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            {/* Left Side Text */}
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Find the <span className="text-primary">perfect match</span> for every role
              </h1>

              <p className="lead mb-4">
                SkillMatrix ATS streamlines your recruitment process with AI-powered
                candidate matching, seamless resume parsing, and comprehensive analytics.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-5">
                <Link to="/Register" className="btn btn-primary btn-lg px-5 py-3">
                  Request for Free Trial
                </Link>
                <a href="#features" className="btn btn-light btn-lg px-5 py-3 fw-bold">
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Side — Post Job Card floating */}
            <div className="col-lg-6 d-flex justify-content-center align-items-center">
              <div className="job-ad-card text-center p-5 bg-warning rounded animated-float shadow-lg">
                <h4 className="fw-bold mb-3 text-dark">🚀 Ready to Hire?</h4>
                <p className="mb-4 text-dark">Post a job and We will promote them!</p>
                <Link to="/jobportal" className="btn btn-dark btn-lg fw-bold">
                  Post a Job – Company Login Only
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5" id="features">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Powerful features for modern recruiters</h2>
            <p className="lead text-muted mx-auto" style={{maxWidth: '700px'}}>
              Everything you need to streamline your recruitment process and find the best talent faster.
            </p>
          </div>
          
          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm transition-ease animate-on-hover">
                <div className="card-body p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 mb-4">
                    <FiSearch />
                  </div>
                  <h4 className="fw-bold mb-3">Smart Resume Parsing</h4>
                  <p className="text-muted">
                    Automatically extract and analyze key information from resumes to find the most qualified candidates.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm transition-ease animate-on-hover">
                <div className="card-body p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 mb-4">
                    <FiUpload />
                  </div>
                  <h4 className="fw-bold mb-3">Easy Job Matching</h4>
                  <p className="text-muted">
                    Upload job descriptions and instantly match them with the most relevant candidate profiles.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm transition-ease animate-on-hover">
                <div className="card-body p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 mb-4">
                    <FiBarChart2 />
                  </div>
                  <h4 className="fw-bold mb-3">Advanced Analytics</h4>
                  <p className="text-muted">
                    Gain valuable insights into your recruitment process with comprehensive reporting and analytics.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm transition-ease animate-on-hover">
                <div className="card-body p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 mb-4">
                    <FiUsers />
                  </div>
                  <h4 className="fw-bold mb-3">Candidate Management</h4>
                  <p className="text-muted">
                    Organize and track candidates throughout the entire recruitment process with custom workflows.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm transition-ease animate-on-hover">
                <div className="card-body p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 mb-4">
                    <FiCheckCircle />
                  </div>
                  <h4 className="fw-bold mb-3">Skill Assessment</h4>
                  <p className="text-muted">
                    Accurately evaluate candidate skills and qualifications with our AI-powered assessment tools.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm transition-ease animate-on-hover">
                <div className="card-body p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 mb-4">
                    <FiClock />
                  </div>
                  <h4 className="fw-bold mb-3">Historical Tracking</h4>
                  <p className="text-muted">
                    View complete candidate history and track recruitment progress over time for better decision-making.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-light py-5" id="how-it-works">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">How Skill Matrix Works ?</h2>
            <p className="lead text-muted mx-auto" style={{maxWidth: '700px'}}>
              A simple, streamlined process to find the best candidates for your open positions
            </p>
          </div>
          
          <div className="workflow-container">
            {/* Step 1 */}
            <div className="workflow-step-container">
              <div className="workflow-content">
                <h4 className="fw-bold mb-3">Upload Job Description</h4>
                <p className="text-muted mb-0">
                  Start by uploading your job description or create one using our AI-powered templates.
                  Our system analyzes requirements and skills automatically.
                </p>
              </div>
              <div className="workflow-icon">
                <FiFileText />
                <div className="workflow-number">1</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="workflow-step-container">
              <div className="workflow-content">
                <h4 className="fw-bold mb-3">Smart Resume Parsing</h4>
                <p className="text-muted mb-0">
                  Upload candidate resumes individually or in bulk. Our AI automatically extracts
                  and analyzes key information, skills, and experience.
                </p>
              </div>
              <div className="workflow-icon">
                <FiSearch />
                <div className="workflow-number">2</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="workflow-step-container">
              <div className="workflow-content">
                <h4 className="fw-bold mb-3">AI-Powered Matching</h4>
                <p className="text-muted mb-0">
                  Our advanced AI algorithms analyze and score candidates based on job requirements,
                  providing detailed matching insights and recommendations.
                </p>
              </div>
              <div className="workflow-icon">
                <FiUserCheck />
                <div className="workflow-number">3</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="workflow-step-container">
              <div className="workflow-content">
                <h4 className="fw-bold mb-3">Automated Video Interviews</h4>
                <p className="text-muted mb-0">
                  Schedule and conduct AI-powered video interviews. Get intelligent insights
                  on candidate communication, skills, and cultural fit.
                </p>
              </div>
              <div className="workflow-icon">
                <FiVideo />
                <div className="workflow-number">4</div>
              </div>
            </div>
          </div>
        </div>
      </section>

         {/* Pricing Section */}
      <section className="py-5" id="pricing">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="lead text-muted">Choose the plan that's right for your business</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="pricing-enterprise p-5 rounded-lg bg-gradient">
                <h3 className="text-black mb-4">Enterprise Solution</h3>
                <p className="text-black-50 mb-4">
                  Looking for a custom solution? We offer tailored enterprise packages to meet your specific needs.
                </p>
                <a 
                  href="https://cognitbotz.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-light btn-lg px-5"
                >
                  Contact Enterprise Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
  <section className="py-5 bg-light" id="about">
  <div className="container py-5" style={{ fontFamily: "'Inter', sans-serif", color: "#222" }}>
    <div className="row align-items-center">
      <div className="col-lg-6 mb-4 mb-lg-0">
        <h2 className="display-5 fw-bold mb-4" style={{ letterSpacing: "0.03em", fontWeight: 700 }}>
          About Skill Matrix ATS
        </h2>
        <p className="lead mb-4" style={{ fontWeight: 600, fontSize: "1.25rem", color: "#444" }}>
          We're revolutionizing the way companies handle their recruitment process through innovative technology and AI-powered solutions.
        </p>
        <p className="text-muted mb-4" style={{ fontWeight: 400, fontSize: "1rem", color: "#666" }}>
          Our mission is to simplify and streamline the hiring process, making it easier for companies to find and hire the best talent. With our advanced ATS system, we're helping organizations make better hiring decisions and build stronger teams.
        </p>
        <div className="d-flex gap-3">
          <a href="#features" className="btn btn-primary" style={{ fontWeight: 600, fontSize: "1rem", padding: "0.625rem 1.5rem" }}>
            Explore Features
          </a>
          <Link to="/register" className="btn btn-outline-primary" style={{ fontWeight: 600, fontSize: "1rem", padding: "0.625rem 1.5rem" }}>
            Get Started
          </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image-container bg-white p-4 rounded-lg shadow-lg">
                <div className="about-stats row g-4">
                  <div className="col-6">
                    <div className="p-4 rounded bg-light text-center">
                      <h3 className="fw-bold text-primary mb-2">1000+</h3>
                      <p className="mb-0">Companies Trust Us</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-4 rounded bg-light text-center">
                      <h3 className="fw-bold text-primary mb-2">50K+</h3>
                      <p className="mb-0">Successful Hires</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-4 rounded bg-light text-center">
                      <h3 className="fw-bold text-primary mb-2">98%</h3>
                      <p className="mb-0">Client Satisfaction</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-4 rounded bg-light text-center">
                      <h3 className="fw-bold text-primary mb-2">24/7</h3>
                      <p className="mb-0">Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> 

      {/* Testimonials Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Trusted by hiring teams everywhere</h2>
            <p className="lead text-muted">See what our customers have to say about Skill Matrix ATS</p>
          </div>
          
          <div className="row g-4">
            {/* Testimonial 1 */}
            <div className="col-md-4 mb-4">
              <div className="testimonial-card h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary text-white rounded-circle p-2 me-3">
                    <span className="fw-bold">AB</span>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">Alex Brown</h5>
                    <p className="small text-muted mb-0">HR Director, TechCorp</p>
                  </div>
                </div>
                <p className="mb-0">
                  "Skill Matrix ATS has completely transformed our hiring process. We've reduced time-to-hire by 40% and found better candidates for our technical roles."
                </p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="col-md-4 mb-4">
              <div className="testimonial-card h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary text-white rounded-circle p-2 me-3">
                    <span className="fw-bold">SJ</span>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">Sarah Johnson</h5>
                    <p className="small text-muted mb-0">Recruitment Lead, Finance Pro</p>
                  </div>
                </div>
                <p className="mb-0">
                  "The resume matching features in Skill Matrix ATS are incredibly accurate. We're now spending less time screening candidates and more time on meaningful interviews."
                </p>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="col-md-4 mb-4">
              <div className="testimonial-card h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary text-white rounded-circle p-2 me-3">
                    <span className="fw-bold">MP</span>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">Michael Patel</h5>
                    <p className="small text-muted mb-0">CEO, StartUp Innovate</p>
                  </div>
                </div>
                <p className="mb-0">
                  "As a growing company, we needed an ATS that could scale with us. Skill Matrix has been the perfect solution, helping us build our team efficiently and effectively."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to transform your recruitment process?</h2>
          <p className="lead mb-5">Join thousands of companies using Skill Matrix ATS to find and hire the best talent faster.</p>
          <Link to="/Register" className="btn btn-light btn-lg px-5 py-3 fw-bold">
            Request for Free Trial
          </Link>
          <p className="text-white-50 mt-3">No credit card required. Free 14-day trial.</p>
        </div>
      </section>
    </>
  )
}

export default LandingPage