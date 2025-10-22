import React from 'react';
import { Box, Typography } from '@mui/material';
import { TIMELINE_COLORS } from '../../constants/timelineConstants';
import { getTimelineMarkers } from '../../utils/timelineUtils';
import { useTimeline } from '../../contexts/TimelineContext';

const TimelineRuler = ({ width }) => {
  const { duration, zoom } = useTimeline();
  const markers = getTimelineMarkers(duration, zoom, width);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 30,
        backgroundColor: TIMELINE_COLORS.background,
        borderBottom: `1px solid ${TIMELINE_COLORS.trackBorder}`,
        overflow: 'hidden',
      }}
    >
      {markers.map((marker) => (
        <Box
          key={marker.time}
          sx={{
            position: 'absolute',
            left: `${marker.position}px`,
            top: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: 1,
              height: marker.isMajor ? 12 : 8,
              backgroundColor: TIMELINE_COLORS.rulerLine,
            }}
          />
          {marker.isMajor && (
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                color: TIMELINE_COLORS.ruler,
                marginLeft: 0.5,
                userSelect: 'none',
              }}
            >
              {marker.label}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default TimelineRuler;
