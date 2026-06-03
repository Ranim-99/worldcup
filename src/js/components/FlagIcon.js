import React from 'react';

const ClubFlagIcon = ({ code, size = '1x', ...props }) => {
  const getSizeStyle = (s) =>
    ({ '1x': '1em', '2x': '1.5em', '3x': '3em', '4x': '4em', '5x': '5em' }[s] || '1em');

  return (
    <img
      src={code?.url}
      alt={code?.title}
      title={code?.title}
      style={{
        height: getSizeStyle(size),
        width: 'auto',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    />
  );
};

export default ClubFlagIcon;