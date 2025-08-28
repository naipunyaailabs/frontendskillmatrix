import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faUsers,
  faFileLines,
  faClock,
  faGear,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

function Sidebar({ }) {
  return (
    <div style={{ 
      minWidth: '30px', 
      minHeight: '100vh',
      backgroundColor: 'white', // Darker background
      borderRight: '1.5px solid rgba(0, 0, 0, 0.13)',
    
    }}>
      <div className="d-flex flex-column justify-content-center align-items-center h-60">
        <div className="p-4 border-bottom justify-content-center align-items-center" style={{ backgroundColor: 'white', }}>
       
        </div>
        <ul className="nav justify-content-center flex-column p-2" style={{border:'black'}}>
          <li className="nav-item mb-1">
            <Link to="/dashboard" className="nav-link text-red px-3 py-2 rounded">
              <FontAwesomeIcon icon={faHome} className="me-3" /> 
              <span style={{ fontSize: '14px', fontWeight: '500' }}></span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/dashboard/candidates" className="nav-link text-red px-3 py-2 rounded">
              <FontAwesomeIcon icon={faUsers} className="me-3" /> 
              <span style={{ fontSize: '14px', fontWeight: '500' }}></span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/dashboard/reports" className="nav-link text-red px-3 py-2 rounded">
              <FontAwesomeIcon icon={faFileLines} className="me-3" /> 
              <span style={{ fontSize: '14px', fontWeight: '500' }}></span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/dashboard/history" className="nav-link text-red px-3 py-2 rounded">
              <FontAwesomeIcon icon={faClock} className="me-3" /> 
              <span style={{ fontSize: '14px', fontWeight: '500' }}></span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/dashboard/settings" className="nav-link text-black px-3 py-2 rounded">
              <FontAwesomeIcon icon={faGear} className="me-3" /> 
              <span style={{ fontSize: '14px', fontWeight: '500' }}></span>
            </Link>
          </li>
          
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;

