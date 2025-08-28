// components/Modals/WelcomeModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const WelcomeModal = ({ show, onClose, userName }) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton style={{ background: 'rgb(11, 39, 67)' }}>
        <Modal.Title className="w-100  text-center" style={{ fontWeight: 'bold', color: 'white' }}>
           Welcome to SkillMatrix ATS !
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center" style={{ backgroundColor: 'rgb(7, 63, 122)' }}>
      
        <h4
  className=" text-decoration-underline"
  style={{ color: 'rgb(153, 197, 245)' }}
>
  Hi !!! {userName || 'User'}
</h4>

<h5
  className="mb-3"
  style={{ color: 'rgb(153, 197, 245)' }}
>
  You have successfully logged in 💖!
</h5>
        <h6 style={{ fontSize: '0.9rem', color: 'rgb(153, 197, 245)' }}>
          Head to the Upload section to begin your journey with us .
        </h6>
        <img
          src="https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif"
          alt="welcome"
          className="img-fluid rounded-circle mt-3"
          style={{ maxHeight: '375px', maxWidth: '375px' }}
        />

      </Modal.Body>
      <Modal.Footer className="justify-content-center" style={{ backgroundColor: 'rgb(3, 38, 72)' }}>
        <Button
          variant="primary"
          onClick={onClose}
          style={{
            borderRadius: '30px',
            padding: '10px 30px',
            background: 'linear-gradient(135deg,rgb(46, 183, 89) 0%,rgb(14, 126, 40) 100%)',
            border: 'none',
            fontWeight: '600',
          }}
        >
          Let’s Go!
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
