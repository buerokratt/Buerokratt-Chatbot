import React from 'react';

interface LoaderOverlayProps {
  maxPercent: number;
  currentPercent: number;
}

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({
  maxPercent,
  currentPercent,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${((maxPercent - currentPercent) / maxPercent) * 100}%`, // Modified: Deduct from the full width
    maxWidth: '100%',
    backgroundColor: 'rgba(211, 211, 211, 0.7)',
    transition: 'width 1s linear',
    visibility: currentPercent > 0 ? 'visible' : 'hidden',
    borderRadius: '30px 0px 0px 30px',
  };

  return (
    <div style={overlayStyle}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      ></div>
    </div>
  );
};

export default LoaderOverlay;
