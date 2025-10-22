import React from 'react';
import { Box } from '@mui/material';

const TrimHandle = ({ side, onTrimStart, onTrimEnd }) => {
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onTrimStart(e);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        [side]: 0,
        top: 0,
        bottom: 0,
        width: 8,
        cursor: side === 'left' ? 'w-resize' : 'e-resize',
        backgroundColor: 'transparent',
        zIndex: 10,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          [side]: 2,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 2,
          height: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1,
        },
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default TrimHandle;
