import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { TIMELINE_COLORS } from '../../constants/timelineConstants';
import { timeToPixels } from '../../utils/timelineUtils';
import { useTimeline } from '../../contexts/TimelineContext';

const Playhead = ({ containerRef }) => {
  const { playhead, setPlayhead, zoom, duration, snapping } = useTimeline();
  const [isDragging, setIsDragging] = useState(false);
  const playheadRef = useRef(null);

  const position = timeToPixels(playhead, zoom);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;

      let newTime = Math.max(0, Math.min(x / zoom, duration));

      // Snap to markers if enabled
      if (snapping) {
        const snapThreshold = 10 / zoom; // 10 pixels in time
        const rounded = Math.round(newTime * 10) / 10; // Snap to 0.1s
        if (Math.abs(newTime - rounded) < snapThreshold) {
          newTime = rounded;
        }
      }

      setPlayhead(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, zoom, duration, setPlayhead, snapping, containerRef]);

  return (
    <Box
      ref={playheadRef}
      sx={{
        position: 'absolute',
        left: `${position}px`,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: TIMELINE_COLORS.playhead,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto',
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: -6,
          width: 14,
          height: 14,
          backgroundColor: TIMELINE_COLORS.playhead,
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
        },
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Playhead;
