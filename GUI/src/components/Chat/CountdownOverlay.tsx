import React from 'react';

interface CountdownOverlayProps {
  totalSeconds: number;
  currentSeconds: number;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  totalSeconds,
  currentSeconds,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${(currentSeconds / totalSeconds) * 100}%`,
    maxWidth: '100%',
    backgroundColor: 'rgba(211, 211, 211, 0.7)',
    transition: 'width 1s linear',
    visibility: currentSeconds > 0 ? 'visible' : 'hidden',
    borderRadius: '30px 0 0 30px',
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

export default CountdownOverlay;
