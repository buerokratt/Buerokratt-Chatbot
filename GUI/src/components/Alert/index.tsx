import React from 'react';
import './Alert.scss';

interface AlertProps {
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="alert">
      <span className="closebtn" onClick={handleClose}>
        &times;
      </span>
      {message}
    </div>
  );
};

export default Alert;
