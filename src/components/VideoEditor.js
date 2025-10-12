import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import FpsControl from './FpsControl';
import VideoPreviewPanel from './VideoPreviewPanel';
import TimelineCanvas from './TimelineCanvas';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#121212',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#1e1e1e',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  fpsControlContainer: {
    flex: '0 0 auto',
    maxWidth: '500px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  previewSection: {
    flex: '1 1 60%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
    minHeight: '300px',
  },
  timelineSection: {
    flex: '0 0 40%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
    borderTop: '2px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    minHeight: '250px',
  },
};

const VideoEditor = ({ file, onExitEdit, defaultFps, currentFps, onFpsChange, onDefaultFpsChange }) => {
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [timelineScroll, setTimelineScroll] = useState(0);
  const [audioWaveformData, setAudioWaveformData] = useState([]);
  const videoRef = useRef(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space: Restart from beginning
      if (e.code === 'Space') {
        e.preventDefault();
        setPlayheadPosition(0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
          setIsPlaying(true);
        }
      }

      // Enter: Pause/Play from current position
      if (e.code === 'Enter') {
        e.preventDefault();
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          } else {
            videoRef.current.play();
            setIsPlaying(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);

  // Generate audio waveform when file loads
  useEffect(() => {
    if (!file) return;

    const generateWaveform = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const rawData = audioBuffer.getChannelData(0);
        const samples = 1000; // Number of samples for waveform
        const blockSize = Math.floor(rawData.length / samples);
        const waveform = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          waveform.push(sum / blockSize);
        }

        // Normalize waveform
        const max = Math.max(...waveform);
        const normalized = waveform.map(v => v / max);

        setAudioWaveformData(normalized);
      } catch (error) {
        console.error('Error generating waveform:', error);
        // Set empty waveform on error
        setAudioWaveformData([]);
      }
    };

    generateWaveform();
  }, [file]);

  const handlePlayheadMove = (newPosition) => {
    setPlayheadPosition(newPosition);
    if (videoRef.current) {
      videoRef.current.currentTime = newPosition;
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      setPlayheadPosition(videoRef.current.currentTime);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = () => {
    // Placeholder for save functionality
    console.log('Save functionality not yet implemented');
    alert('Save functionality will be implemented in future updates');
  };

  return (
    <Box style={styles.container}>
      {/* Top Bar */}
      <Box style={styles.topBar}>
        <Box style={styles.fpsControlContainer}>
          <FpsControl
            originalFps={defaultFps}
            onFpsChange={onFpsChange}
          />
        </Box>

        <Box style={styles.actionButtons}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloseIcon />}
            onClick={onExitEdit}
          >
            Exit Edit
          </Button>
        </Box>
      </Box>

      {/* Video Preview Section */}
      <Box style={styles.previewSection}>
        <VideoPreviewPanel
          file={file}
          videoRef={videoRef}
          currentTime={playheadPosition}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onTimeUpdate={handleVideoTimeUpdate}
          onLoaded={handleVideoLoaded}
          defaultFps={defaultFps}
          currentFps={currentFps}
        />
      </Box>

      {/* Timeline Section */}
      <Box style={styles.timelineSection}>
        <TimelineCanvas
          duration={duration}
          playheadPosition={playheadPosition}
          onPlayheadMove={handlePlayheadMove}
          zoom={timelineZoom}
          onZoomChange={setTimelineZoom}
          scroll={timelineScroll}
          onScrollChange={setTimelineScroll}
          audioWaveformData={audioWaveformData}
          isPlaying={isPlaying}
        />
      </Box>
    </Box>
  );
};

export default VideoEditor;
