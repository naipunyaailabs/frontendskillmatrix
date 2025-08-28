import { Link } from 'react-router-dom';
import SMlogo from "../../assets/SMlogo.png";

const Footer = () => {

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }


  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row">
           <div className="col-lg-3 mb-4 mb-lg-0">
            <div className="d-flex align-items-center text-white mb-3">
              <img
                src={SMlogo}
                alt="SM Logo"
                className="rounded-circle img-fluid"
                style={{
                  width: "50px",
                  height: "50px",
                  border: "2px solid black",
                  boxShadow: "0 0 5px rgba(0,0,0,0.3)"
                }}
              />
              <span className="ms-2 fw-bold">Skill Matrix</span>
            </div>
            <p className="small text-white">
              Skill Matrix ATS is an intelligent recruitment solution that transforms how companies find, evaluate, and hire top talent.
            </p>
            <p className="small text-white mt-3">
              © 2023 Skill Matrix ATS. All rights reserved.
            </p>
          </div>
          <div className="col-6 col-lg-3 mb-4 mb-lg-0">
            <h5 className="mb-3 fw-bold text-primary">Product</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a 
                  href="#features" 
                  className="text-white footer-link"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('features')
                  }}
                >
                  Features
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="#pricing" 
                  className="text-white footer-link"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('pricing')
                  }}
                >
                  Pricing
                </a>
              </li>
              <li className="mb-2"><Link to="#" className="text-white footer-link">Customers</Link></li>
              <li className="mb-2"><Link to="#" className="text-white footer-link">Integrations</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-lg-3 mb-4 mb-lg-0">
            <h5 className="mb-3 fw-bold text-primary">Resources</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="#" className="text-white footer-link">Blog</Link></li>
              <li className="mb-2"><Link to="#" className="text-white footer-link">Guides</Link></li>
              <li className="mb-2"><Link to="#" className="text-white footer-link">Webinars</Link></li>
              <li className="mb-2"><Link to="https://cognitbotz.com" className="text-white footer-link">Help Center</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-lg-3 mb-4 mb-lg-0">
            <h5 className="mb-3 fw-bold text-primary">Company</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a 
                  href="#about" 
                  className="text-white footer-link"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('about')
                  }}
                >
                  About Us
                </a>
              </li>
              <li className="mb-2"><Link to="#" className="text-white footer-link">Careers</Link></li>
              <li className="mb-2"><Link to="https://cognitbotz.com" className="text-white footer-link">Contact</Link></li>
              <li className="mb-2"><Link to="#" className="text-white footer-link">Legal</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="row mt-4 pt-4 border-top border-secondary">
          <div className="col-md-6 mb-3 mb-md-0">
            <ul className="list-inline mb-0">
              <li className="list-inline-item me-3">
                <Link to="#" className="text-white small footer-link">Privacy Policy</Link>
              </li>
              <li className="list-inline-item me-3">
                <Link to="#" className="text-white small footer-link">Terms of Service</Link>
              </li>
              <li className="list-inline-item">
                <Link to="#" className="text-white small footer-link">Cookies</Link>
              </li>
            </ul>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-white small mb-0">
              Product by / Owned by <a href="https://cognitbotz.com" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">COGNITBOTZ Solutions</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer