import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Button, Modal, Container, Row, Col, Badge, Alert } from 'react-bootstrap';
import TopNotificationModal from '../Dashboard/TopNotificationModal';

import { axiosInstance } from '../../axiosUtils';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
const [notificationMessage, setNotificationMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/user', { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch user details');
      }
    };
    fetchUser();
  }, []);

const handleLogout = async () => {
  try {
    await axiosInstance.post('/logout', {}, { withCredentials: true });
    setNotificationMessage("Logout successful. See you again!");
    setShowNotification(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  } catch (error) {
    console.error('Logout failed:', error);
    toast.error('Logout failed. Please try again.');
  }
};


 // Update the subscription section
 
  // Update the subscription section
  const getSubscriptionStatus = () => {
    if (!user.subscription) return 'No active subscription';
    
    const planName = user.subscription.plan.charAt(0).toUpperCase() + 
                    user.subscription.plan.slice(1);
    
    if (user.subscription.plan === 'paid') {
      return `Paid Plan (Expires: ${new Date(user.subscription.expiresAt).toLocaleDateString()})`;
    }
    
    if (user.subscription.plan === 'free') {
      return 'Free Plan (Unlimited)';
    }
    
    if (user.subscription.plan === 'trial') {
      return `Trial (Expires: ${new Date(user.subscription.expiresAt).toLocaleDateString()})`;
    }
    
    return `${planName} Plan`;
  };


const handleSave = () => {
  // save logic...
  setNotificationMessage("Profile updated successfully!");
  setShowNotification(true);
};

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  if (!user) return <div>Loading...</div>;

  return (
    <Container className="py-5" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {showNotification && (
  <TopNotificationModal
    message={notificationMessage}
    onClose={() => setShowNotification(false)}
  />
)}

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            {/* Profile Header with Blue Gradient */}
            <div style={{
              background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
              height: '120px',
              position: 'relative'
            }}>
              {/* Logout button in top right corner */}
            <Button 

  onClick={handleLogout}
  style={{
    position: 'absolute',
    top: '10px',
        backgroundColor: '#dc3545', // Bootstrap red
    right: '10px',
    color: 'white', // Optional override
    zIndex: 1
  }}
>
  <i className="fas fa-sign-out-alt me-1"></i> Logout
</Button>

              
              {/* Profile Picture Placeholder */}
              <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#fff',
                border: '5px solid #fff',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4e73df',
                fontSize: '40px',
                fontWeight: 'bold'
              }}>
                {user.fullName.charAt(0)}
              </div>
            </div>

            {/* Profile Body */}
            <Card.Body className="pt-5 px-4 pb-4">
              <div className="text-center mt-4 mb-4">
                <h2 className="mb-1" style={{ fontWeight: '600', color: '#2e3a4d' }}>{user.fullName}</h2>
                <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                  <i className="fas fa-map-marker-alt me-1"></i> 
                </p>
                <p className="mb-3" style={{ color: '#4e73df', fontWeight: '500' }}>
                  Hyderabad-Telangana<br />
                  India
                </p>
                
                {/* Stats Row */}
                

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-3">
                  <Button 
                    variant="outline-primary" 
                    className="px-4 py-2" 
                    style={{ 
                      borderRadius: '20px',
                      fontWeight: '600',
                      borderWidth: '2px'
                    }}
                    onClick={handleShowModal}
                  >
                    <i className="fas fa-pen me-2"></i> Edit Profile
                  </Button>
                  <Button 
                    variant="primary" 
                    className="px-4 py-2" 
                    style={{ 
                      borderRadius: '20px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
                      border: 'none'
                    }}
                  >
                    <i className="fas fa-paper-plane me-2"></i> Message
                  </Button>
                </div>
              </div>
            </Card.Body>
            <Card.Body className="px-4">
   <div className="subscription-section mt-4">
        <h4 className="text-center mb-3">
          <i className="fas fa-crown me-2"></i>
          Subscription Plan
        </h4>
        
        <div className="text-center mb-3">
          <Badge bg={
            user.subscription?.plan === 'paid' ? 'success' : 
            user.subscription?.plan === 'free' ? 'info' : 'warning'
          }>
            {getSubscriptionStatus()}
          </Badge>
        </div>

        {user.subscription?.plan === 'trial' && (
          <Alert variant="warning" className="text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Trial period active. Upgrade for full access.
          </Alert>
        )}

        {user.subscription?.limits && (
          <div className="usage-meters">
            <div className="mb-3">
              <label className="form-label">
                JD Uploads: {user.usage?.jdUploads || 0}/{user.subscription.limits.jdUploads}
              </label>
              <progress 
                value={user.usage?.jdUploads || 0} 
                max={user.subscription.limits.jdUploads} 
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Resume Uploads: {user.usage?.resumeUploads || 0}/{user.subscription.limits.resumeUploads}
              </label>
              <progress 
                value={user.usage?.resumeUploads || 0} 
                max={user.subscription.limits.resumeUploads} 
              />
            </div>

            <div>
              <label className="form-label">
                Assessments: {user.usage?.assessments || 0}/{user.subscription.limits.assessments}
              </label>
              <progress 
                value={user.usage?.assessments || 0} 
                max={user.subscription.limits.assessments} 
              />
            </div>
          </div>
        )}
      </div>
  
  
</Card.Body>

          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
          <Modal.Title style={{ color: '#333', fontWeight: '600' }}>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
          <form>
            <div className="form-group mb-3">
              <label style={{ color: '#333', fontWeight: '500' }}>Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                defaultValue={user.fullName} 
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  padding: '10px'
                }} 
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ color: '#333', fontWeight: '500' }}>Email</label>
              <input 
                type="email" 
                className="form-control" 
                defaultValue={user.email} 
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  padding: '10px'
                }} 
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ color: '#333', fontWeight: '500' }}>Phone</label>
              <input 
                type="text" 
                className="form-control" 
                defaultValue="123456789" 
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  padding: '10px'
                }} 
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
          <Button 
            variant="secondary" 
            onClick={handleCloseModal} 
            style={{ 
              borderRadius: '20px',
              padding: '8px 20px',
              fontWeight: '500',
              border: 'none'
            }}
          >
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCloseModal} 
            style={{ 
              borderRadius: '20px',
              padding: '8px 20px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
              border: 'none'
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile;