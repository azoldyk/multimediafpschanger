import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Button, Toolbar, Tooltip, ButtonGroup } from '@mui/material';
import {
  PlayArrow,
  Pause,
  Add as AddIcon,
  ContentCut as CutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { TimelineProvider, useTimeline } from '../../contexts/TimelineContext';
import { TIMELINE_COLORS, TRACK_TYPES, ZOOM_LEVELS } from '../../constants/timelineConstants';
import { timeToPixels } from '../../utils/timelineUtils';
import TimelineRuler from './TimelineRuler';
import Track from './Track';
import Playhead from './Playhead';
import ZoomControls from './ZoomControls';

const TimelineEditorContent = ({ file, onExitEdit, onPlayheadChange, onTrackMuteChange, onPlayingChange }) => {
  const {
    tracks,
    playhead,
    duration,
    zoom,
    playing,
    setPlaying,
    setZoom,
    setPlayhead,
    setDuration,
    addTrack,
    addClip,
    splitClip,
    selectedClips,
  } = useTimeline();

  const containerRef = useRef(null);
  const tracksContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  // Initialize with default tracks
  useEffect(() => {
    if (tracks.length === 0) {
      addTrack(TRACK_TYPES.VIDEO, 'Video Track 1');
      addTrack(TRACK_TYPES.AUDIO, 'Audio Track 1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add the file as clip after tracks are created
  useEffect(() => {
    if (file && tracks.length > 0) {
      // Check if clip already exists
      const hasClip = tracks.some(track => track.clips.length > 0);
      if (hasClip) return;

      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        const clipDuration = video.duration;
        URL.revokeObjectURL(video.src);

        const clip = {
          file,
          fileUrl: URL.createObjectURL(file),
          startTime: 0,
          duration: clipDuration,
          originalDuration: clipDuration,
          trimStart: 0,
          trimEnd: 0,
          volume: 1.0,
          effects: [],
          waveform: null,
        };

        // Find the video track and add clip
        const videoTrack = tracks.find((t) => t.type === TRACK_TYPES.VIDEO);
        console.log('Adding clip to track:', videoTrack?.id, 'Clip duration:', clipDuration);
        if (videoTrack) {
          addClip(videoTrack.id, clip);
        }
      };

      video.onerror = (e) => {
        console.error('Error loading video:', e);
        URL.revokeObjectURL(video.src);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, file]);

  // Update parent component when playhead changes
  useEffect(() => {
    if (onPlayheadChange) {
      onPlayheadChange(playhead, tracks);
    }
  }, [playhead, tracks, onPlayheadChange]);

  // Update timeline duration based on clips
  useEffect(() => {
    let maxDuration = 30; // minimum duration
    tracks.forEach(track => {
      track.clips.forEach(clip => {
        const clipEnd = clip.startTime + clip.duration;
        if (clipEnd > maxDuration) {
          maxDuration = clipEnd;
        }
      });
    });
    if (maxDuration !== duration) {
      setDuration(maxDuration + 5); // Add 5 seconds buffer
    }
  }, [tracks, duration, setDuration]);

  // Notify parent when any track is muted
  useEffect(() => {
    if (onTrackMuteChange) {
      const videoTracks = tracks.filter(t => t.type === 'video');
      const anyMuted = videoTracks.some(t => t.muted);
      onTrackMuteChange(anyMuted);
    }
  }, [tracks, onTrackMuteChange]);

  // Notify parent about playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(playing);
    }
  }, [playing, onPlayingChange]);

  // Auto-advance playhead during playback
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setPlayhead(prev => {
        const newTime = prev + 0.016; // ~60fps
        if (newTime >= duration) {
          setPlaying(false);
          return prev;
        }
        return newTime;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [playing, duration, setPlayhead, setPlaying]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (tracksContainerRef.current) {
        setContainerWidth(tracksContainerRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        const newZoom = zoom * Math.pow(ZOOM_LEVELS.STEP, delta);
        setZoom(Math.max(ZOOM_LEVELS.MIN, Math.min(ZOOM_LEVELS.MAX, newZoom)));
      }
    };

    const container = tracksContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [zoom, setZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying(!playing);
          break;
        case 'Delete':
        case 'Backspace':
          // Delete selected clips (implement in context)
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playing, setPlaying]);

  const handleAddVideoTrack = () => {
    addTrack(TRACK_TYPES.VIDEO);
  };

  const handleAddAudioTrack = () => {
    addTrack(TRACK_TYPES.AUDIO);
  };

  const handleSplitClip = () => {
    if (selectedClips.length === 1) {
      splitClip(selectedClips[0], playhead);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const timelineWidth = Math.max(timeToPixels(duration, zoom), containerWidth);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: TIMELINE_COLORS.background,
        color: '#fff',
      }}
    >
      {/* Toolbar */}
      <Toolbar
        sx={{
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          gap: 2,
          minHeight: 48,
        }}
      >
        {/* Playback controls */}
        <IconButton onClick={handlePlayPause} sx={{ color: '#fff' }}>
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>

        {/* Tools */}
        <ButtonGroup variant="outlined" size="small">
          <Tooltip title="Split Clip at Playhead">
            <Button
              onClick={handleSplitClip}
              disabled={selectedClips.length !== 1}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <CutIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>

        <Box sx={{ flex: 1 }} />

        {/* Add track buttons */}
        <ButtonGroup variant="outlined" size="small">
          <Tooltip title="Add Video Track">
            <Button
              onClick={handleAddVideoTrack}
              sx={{ color: '#64C8FF', borderColor: 'rgba(100,200,255,0.5)' }}
            >
              <AddIcon /> Video
            </Button>
          </Tooltip>
          <Tooltip title="Add Audio Track">
            <Button
              onClick={handleAddAudioTrack}
              sx={{ color: '#64FFC8', borderColor: 'rgba(100,255,200,0.5)' }}
            >
              <AddIcon /> Audio
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Exit button */}
        <Button
          variant="contained"
          onClick={onExitEdit}
          sx={{
            backgroundColor: '#f50057',
            '&:hover': { backgroundColor: '#c51162' },
          }}
        >
          <CloseIcon sx={{ mr: 0.5 }} />
          Exit Editor
        </Button>
      </Toolbar>

      {/* Timeline area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar spacer (matches track headers) */}
        <Box
          sx={{
            width: 150,
            flexShrink: 0,
            backgroundColor: '#1e1e1e',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* Tracks container with ruler */}
        <Box
          ref={tracksContainerRef}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {/* Timeline ruler */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              backgroundColor: TIMELINE_COLORS.background,
            }}
          >
            <TimelineRuler width={timelineWidth} />
          </Box>

          {/* Tracks */}
          <Box
            sx={{
              position: 'relative',
              minWidth: `${timelineWidth}px`,
              flex: 1,
            }}
          >
            {tracks.map((track) => (
              <Track key={track.id} track={track} />
            ))}

            {/* Playhead overlay */}
            <Playhead containerRef={tracksContainerRef} />
          </Box>

          {/* Empty state */}
          {tracks.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <AddIcon sx={{ fontSize: 48, mb: 1 }} />
              <Box>Add a track to get started</Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer with zoom controls */}
      <ZoomControls />
    </Box>
  );
};

const TimelineEditor = ({ file, onExitEdit, onPlayheadChange, onTrackMuteChange, onPlayingChange }) => {
  return (
    <TimelineProvider>
      <TimelineEditorContent
        file={file}
        onExitEdit={onExitEdit}
        onPlayheadChange={onPlayheadChange}
        onTrackMuteChange={onTrackMuteChange}
        onPlayingChange={onPlayingChange}
      />
    </TimelineProvider>
  );
};

export default TimelineEditor;
