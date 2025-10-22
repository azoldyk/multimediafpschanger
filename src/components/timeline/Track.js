import React from 'react';
import { Box } from '@mui/material';
import TrackHeader from './TrackHeader';
import TrackLane from './TrackLane';

const Track = ({ track }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
      }}
    >
      <TrackHeader track={track} />
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <TrackLane track={track} />
      </Box>
    </Box>
  );
};

export default Track;
