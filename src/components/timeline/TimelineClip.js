import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { TIMELINE_COLORS } from '../../constants/timelineConstants';
import { timeToPixels, pixelsToTime } from '../../utils/timelineUtils';
import { useTimeline } from '../../contexts/TimelineContext';
import TrimHandle from './TrimHandle';

const TimelineClip = ({ clip, trackType }) => {
  const { zoom, updateClip, selectClip, selectedClips, setPlayhead } = useTimeline();
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState(null); // 'left' or 'right'
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });
  const clipRef = useRef(null);

  const isSelected = selectedClips.includes(clip.id);
  const left = timeToPixels(clip.startTime, zoom);
  const width = timeToPixels(clip.duration, zoom);

  const clipColor =
    trackType === 'video'
      ? TIMELINE_COLORS.clipVideo
      : TIMELINE_COLORS.clipAudio;

  const borderColor = isSelected
    ? TIMELINE_COLORS.clipBorderSelected
    : trackType === 'video'
    ? TIMELINE_COLORS.clipBorder
    : TIMELINE_COLORS.clipBorderAudio;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    const multiSelect = e.metaKey || e.ctrlKey;
    selectClip(clip.id, multiSelect);

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      time: clip.startTime,
    });
  };

  const handleTrimStart = (side) => (e) => {
    e.stopPropagation();
    setIsTrimming(side);
    setDragStart({
      x: e.clientX,
      time: clip.startTime,
      duration: clip.duration,
    });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    // Jump playhead to clip start
    setPlayhead(clip.startTime);
  };

  useEffect(() => {
    if (!isDragging && !isTrimming) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaTime = pixelsToTime(deltaX, zoom);

      if (isDragging) {
        // Move clip
        const newStartTime = Math.max(0, dragStart.time + deltaTime);
        updateClip(clip.id, { startTime: newStartTime });
      } else if (isTrimming === 'left') {
        // Trim start
        const newStartTime = Math.max(0, dragStart.time + deltaTime);
        const newDuration = dragStart.duration - deltaTime;

        if (newDuration > 0.1) {
          updateClip(clip.id, {
            startTime: newStartTime,
            duration: newDuration,
            trimStart: clip.trimStart + deltaTime,
          });
        }
      } else if (isTrimming === 'right') {
        // Trim end
        const newDuration = Math.max(0.1, dragStart.duration + deltaTime);
        updateClip(clip.id, {
          duration: newDuration,
          trimEnd: clip.trimEnd - deltaTime,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsTrimming(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isTrimming, dragStart, zoom, clip, updateClip]);

  return (
    <Box
      ref={clipRef}
      sx={{
        position: 'absolute',
        left: `${left}px`,
        top: 4,
        bottom: 4,
        width: `${width}px`,
        minWidth: 20,
        backgroundColor: clipColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isSelected ? 'none' : 'box-shadow 0.2s',
        boxShadow: isSelected
          ? `0 0 15px ${TIMELINE_COLORS.clipBorderSelected}`
          : 'none',
        overflow: 'hidden',
        userSelect: 'none',
        '&:hover': {
          boxShadow: `0 0 10px ${borderColor}`,
        },
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Clip label */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          left: 4,
          top: 2,
          fontSize: 10,
          color: '#fff',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 'calc(100% - 8px)',
        }}
      >
        {clip.file?.name || 'Untitled Clip'}
      </Typography>

      {/* Waveform placeholder for audio clips */}
      {trackType === 'audio' && clip.waveform && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            opacity: 0.5,
          }}
        >
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <path
              d={generateWaveformPath(clip.waveform, width, 30)}
              fill="rgba(255, 255, 255, 0.3)"
            />
          </svg>
        </Box>
      )}

      {/* Trim handles */}
      <TrimHandle side="left" onTrimStart={handleTrimStart('left')} />
      <TrimHandle side="right" onTrimStart={handleTrimStart('right')} />
    </Box>
  );
};

// Helper function to generate SVG path for waveform
const generateWaveformPath = (waveform, width, height) => {
  if (!waveform || waveform.length === 0) return '';

  const stepX = width / waveform.length;
  const centerY = height / 2;
  let path = `M 0 ${centerY}`;

  waveform.forEach((amplitude, i) => {
    const x = i * stepX;
    const y = centerY - amplitude * centerY;
    path += ` L ${x} ${y}`;
  });

  // Draw bottom half
  for (let i = waveform.length - 1; i >= 0; i--) {
    const x = i * stepX;
    const y = centerY + waveform[i] * centerY;
    path += ` L ${x} ${y}`;
  }

  return path + ' Z';
};

export default TimelineClip;
