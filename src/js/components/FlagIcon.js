import React from 'react';
import ReactCountryFlag from 'react-country-flag';

const FlagIcon = ({ code, size = '1x', ...props }) => {
  // Convert size prop to style for react-country-flag
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
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{
        width: getSizeStyle(size),
        height: getSizeStyle(size),
      }}
      title={code}
      {...props}
    />
  );
};

export default FlagIcon;

