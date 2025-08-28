import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCopy, FaExternalLinkAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { RiShareForwardFill } from 'react-icons/ri';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import './SuccessModal.css';

const SuccessModal = ({ publicUrl, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaNative = async () => {
    try {
      await navigator.share({
        title: 'Check out this job opportunity',
        text: 'I found this interesting job posting you might want to apply for',
        url: publicUrl
      });
    } catch (err) {
      console.log('Native sharing not supported', err);
      copyToClipboard();
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      <AnimatePresence>
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="modal-box success-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="success-icon">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#4BB543" />
                <path
                  fill="none"
                  stroke="#FFF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  d="M30 50 l15 15 l30 -30"
                />
              </svg>
            </div>

            <h3 className="modal-title">🎉 Job Posted Successfully!</h3>
            <p className="modal-subtitle">
              Your job listing is now live and ready to receive applications
            </p>

            <div className="share-section">
              <div className="url-container">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="url-input"
                  aria-label="Public job URL"
                />
                <button
                  onClick={copyToClipboard}
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  aria-label="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <FaCheck className="icon" /> Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy className="icon" /> Copy
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={shareViaNative}
                className="share-btn"
                aria-label="Share job"
              >
                <RiShareForwardFill className="icon" /> Share via...
              </button>
            </div>

            <div className="button-group">
              <button
                className="btn-view-job"
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <FaExternalLinkAlt className="icon" /> View Public Listing
              </button>
              <button
                className="btn-dashboard"
                onClick={() => {
                  onClose();
                  navigate('/jobportal/dashboard');
                }}
              >
                <FaArrowLeft className="icon" /> Back to Dashboard
              </button>
            </div>

            <div className="success-tip">
              <p>
                <strong>Pro Tip:</strong> Share this link on social media to reach more candidates
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default SuccessModal;