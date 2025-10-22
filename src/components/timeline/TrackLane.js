import React from 'react';
import { Box } from '@mui/material';
import { TIMELINE_COLORS } from '../../constants/timelineConstants';
import { useTimeline } from '../../contexts/TimelineContext';
import TimelineClip from './TimelineClip';
import { pixelsToTime } from '../../utils/timelineUtils';

const TrackLane = ({ track }) => {
  const { setPlayhead, addClip, deselectAll, zoom } = useTimeline();

  const handleClick = (e) => {
    if (e.target === e.currentTarget) {
      // Clicked on empty track area
      deselectAll();

      // Jump playhead to click position
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollLeft = e.currentTarget.parentElement.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;
      const time = pixelsToTime(x, zoom);
      setPlayhead(time);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (track.locked) return;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    const time = pixelsToTime(x, zoom);

    // Add clips from dropped files
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('video/') && track.type === 'video') {
        addClipFromFile(file, time + index * 0.1);
      } else if (file.type.startsWith('audio/') && track.type === 'audio') {
        addClipFromFile(file, time + index * 0.1);
      }
    });
  };

  const addClipFromFile = (file, startTime) => {
    // Create video element to get duration
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(video.src);

      const clip = {
        file,
        fileUrl: URL.createObjectURL(file),
        startTime,
        duration,
        originalDuration: duration,
        trimStart: 0,
        trimEnd: 0,
        volume: 1.0,
        effects: [],
        waveform: null,
      };

      addClip(track.id, clip);
    };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = track.locked ? 'none' : 'copy';
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: track.height,
        minWidth: '100%',
        backgroundColor: TIMELINE_COLORS.trackLane,
        borderBottom: `1px solid ${TIMELINE_COLORS.trackBorder}`,
        cursor: track.locked ? 'not-allowed' : 'default',
        opacity: track.locked ? 0.5 : 1,
      }}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Render clips */}
      {track.clips.length > 0 && console.log(`Rendering ${track.clips.length} clips on track ${track.name}`)}
      {track.clips.map((clip) => (
        <TimelineClip key={clip.id} clip={clip} trackType={track.type} />
      ))}

      {/* Visual feedback for drop zone */}
      {!track.locked && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            border: '2px dashed transparent',
            pointerEvents: 'none',
            transition: 'border-color 0.2s',
            '.drop-active &': {
              borderColor: 'rgba(100, 200, 255, 0.5)',
            },
          }}
        />
      )}
    </Box>
  );
};

export default TrackLane;
