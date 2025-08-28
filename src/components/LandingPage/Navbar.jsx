import { Link, useLocation } from 'react-router-dom'
import SMlogo from "../../assets/SMlogo.png";

const Navbar = () => {
  const location = useLocation();
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white py-3">
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* Logo left */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={SMlogo}
            alt="SM Logo"
            className="rounded-circle img-fluid"
            style={{
              width: "80px",
              height: "80px",
              border: "2px solid black",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)"
            }}
          />
        </Link>

        {/* Toggler for small screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Centered nav links */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('features');
                }}
              >
                Features
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('pricing');
                }}
              >
                Pricing
              </a>
            </li>
           
          </ul>
        </div>

        {/* Login/signup buttons right */}
        <div className="d-flex">
          <Link
            to="/login"
            className={`btn btn-outline-primary me-2 ${location.pathname === '/login' ? 'd-none' : ''}`}
          >
            Log in
          </Link>
          <Link
            to="/Register"
            className={`btn btn-primary ${location.pathname === '/signup' ? 'd-none' : ''}`}
          >
            Sign up
          </Link>
        </div>
       
      </div>
    </nav>
  );
}

export default Navbar;
