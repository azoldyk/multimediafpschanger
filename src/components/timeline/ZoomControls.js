import React from 'react';
import { Box, Slider, IconButton, Tooltip, Typography } from '@mui/material';
import { ZoomIn, ZoomOut } from '@mui/icons-material';
import { useTimeline } from '../../contexts/TimelineContext';
import { ZOOM_LEVELS } from '../../constants/timelineConstants';

const ZoomControls = () => {
  const { zoom, setZoom } = useTimeline();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * ZOOM_LEVELS.STEP, ZOOM_LEVELS.MAX));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / ZOOM_LEVELS.STEP, ZOOM_LEVELS.MIN));
  };

  const handleSliderChange = (_, newValue) => {
    setZoom(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: 1,
        backgroundColor: '#1e1e1e',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Tooltip title="Zoom Out">
        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_LEVELS.MIN}
          sx={{ color: '#fff' }}
        >
          <ZoomOut />
        </IconButton>
      </Tooltip>

      <Slider
        value={zoom}
        onChange={handleSliderChange}
        min={ZOOM_LEVELS.MIN}
        max={ZOOM_LEVELS.MAX}
        step={0.1}
        sx={{
          width: 150,
          color: '#64C8FF',
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
          },
        }}
      />

      <Tooltip title="Zoom In">
        <IconButton
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_LEVELS.MAX}
          sx={{ color: '#fff' }}
        >
          <ZoomIn />
        </IconButton>
      </Tooltip>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 60 }}>
        {zoom.toFixed(1)}x
      </Typography>
    </Box>
  );
};

export default ZoomControls;
