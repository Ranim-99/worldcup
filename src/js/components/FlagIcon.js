import React from 'react';

const ClubFlagIcon = ({ code, size = '1x', ...props }) => {
  // Map size keyword to actual pixels
  const getSizeStyle = (size) => {
    const sizeMap = {
      '1x': '1em',
      '2x': '2em',
      '3x': '3em',
      '4x': '4em',
      '5x': '5em',
    };
    return sizeMap[size] || '1em';
  };

  return (
    <img
      src={code?.url}
      alt={code?.title}
      title={code?.title}
      style={{
        width: getSizeStyle(size),
        height: getSizeStyle(size),
        objectFit: 'contain',
      }}
      {...props}
    />
  );
};

export default ClubFlagIcon;
