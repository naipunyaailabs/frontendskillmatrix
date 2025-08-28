import React from 'react';
import './TopNotificationModal.css';
import { FaInfoCircle } from 'react-icons/fa';

const TopNotificationModal = ({ message, onClose }) => {
  return (
    <div className="top-toast-container">
      <div className="top-toast-content">
        <FaInfoCircle className="top-toast-icon" />
        <span className="top-toast-message">{message}</span>
        <button className="top-toast-close" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
};

export default TopNotificationModal;
