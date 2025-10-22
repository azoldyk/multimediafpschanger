import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import FpsControl from './FpsControl';
import VideoPreviewPanel from './VideoPreviewPanel';
import TimelineEditor from './timeline/TimelineEditor';

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
  volumeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 16px',
    minWidth: '200px',
  },
  volumeSlider: {
    color: '#f50057',
    width: '120px',
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeClip, setActiveClip] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const handlePlayheadMove = (newPosition, tracks) => {
    setPlayheadPosition(newPosition);

    // Find which clip is at the current playhead position
    if (tracks) {
      let foundClip = null;
      for (const track of tracks) {
        if (track.type === 'video' && !track.muted) {
          const clip = track.clips.find(
            c => newPosition >= c.startTime && newPosition < c.startTime + c.duration
          );
          if (clip) {
            foundClip = { ...clip, trackMuted: track.muted };
            break;
          }
        }
      }

      setActiveClip(foundClip);

      // Update video element
      if (videoRef.current && foundClip) {
        // Calculate the time within the clip (accounting for trim)
        const timeInClip = newPosition - foundClip.startTime;
        const actualVideoTime = foundClip.trimStart + timeInClip;
        videoRef.current.currentTime = actualVideoTime;
        videoRef.current.muted = foundClip.trackMuted || isMuted;
      } else if (videoRef.current) {
        // No clip at this position, pause
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current && activeClip) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackMuteChange = (muted) => {
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  };

  // Sync video playback with timeline
  useEffect(() => {
    if (videoRef.current && activeClip) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.log('Play error:', err);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeClip]);

  return (
    <Box style={styles.container}>
      {/* Video Preview Section */}
      <Box style={styles.previewSection}>
        <Box style={styles.fpsControlContainer} sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <FpsControl
            originalFps={defaultFps}
            onFpsChange={onFpsChange}
          />
        </Box>
        <VideoPreviewPanel
          file={file}
          videoRef={videoRef}
          currentTime={playheadPosition}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          defaultFps={defaultFps}
          currentFps={currentFps}
        />
      </Box>

      {/* Timeline Section */}
      <Box style={styles.timelineSection}>
        <TimelineEditor
          file={file}
          onExitEdit={onExitEdit}
          onPlayheadChange={handlePlayheadMove}
          onTrackMuteChange={handleTrackMuteChange}
          onPlayingChange={setIsPlaying}
        />
      </Box>
    </Box>
  );
};

export default VideoEditor;
