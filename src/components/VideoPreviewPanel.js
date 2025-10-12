import React, { useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { applyFpsAdjustment } from '../utils/videoUtils';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    maxWidth: '1200px',
    maxHeight: '700px',
    position: 'relative',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  video: {
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  overlayVisible: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  playButton: {
    backgroundColor: 'rgba(63, 81, 181, 0.9)',
    color: 'white',
    width: '80px',
    height: '80px',
    '&:hover': {
      backgroundColor: 'rgba(63, 81, 181, 1)',
    },
  },
  timeDisplay: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '8px 16px',
    borderRadius: '4px',
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  noVideo: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
};

const VideoPreviewPanel = ({
  file,
  videoRef,
  currentTime,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onLoaded,
  defaultFps,
  currentFps,
}) => {
  const [fileUrl, setFileUrl] = React.useState('');
  const [showOverlay, setShowOverlay] = React.useState(true);

  // Create object URL for the file
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Apply FPS adjustment when currentFps changes
  useEffect(() => {
    if (videoRef.current && file) {
      applyFpsAdjustment(videoRef.current, defaultFps, currentFps);
    }
  }, [currentFps, defaultFps, file, videoRef]);

  // Hide overlay when playing
  useEffect(() => {
    if (isPlaying) {
      setShowOverlay(false);
    } else {
      setShowOverlay(true);
    }
  }, [isPlaying]);

  const handleVideoClick = () => {
    onPlayPause();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  if (!file) {
    return (
      <Box style={styles.container}>
        <Typography variant="h6" style={styles.noVideo}>
          No video loaded
        </Typography>
      </Box>
    );
  }

  return (
    <Box style={styles.container}>
      <Box style={styles.videoWrapper} onClick={handleVideoClick}>
        <video
          ref={videoRef}
          src={fileUrl}
          style={styles.video}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoaded}
          onEnded={() => onPlayPause()}
        />

        {/* Overlay with play button */}
        <Box
          style={{
            ...styles.overlay,
            ...(showOverlay ? styles.overlayVisible : {}),
          }}
        >
          <IconButton
            style={styles.playButton}
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
          >
            {isPlaying ? (
              <PauseIcon style={{ fontSize: '48px' }} />
            ) : (
              <PlayIcon style={{ fontSize: '48px' }} />
            )}
          </IconButton>
        </Box>

        {/* Time display */}
        <Box style={styles.timeDisplay}>
          {formatTime(currentTime)}
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPreviewPanel;
