import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  CircularProgress, 
  Chip,
  Badge,
  Grid,
  Tooltip,
  IconButton,
  TextField,
  Button,
  Slider
} from '@mui/material';
import {
  Speed as SpeedIcon,
  VideoSettings as VideoIcon,
  RestartAlt as ResetIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  Fullscreen as FullscreenIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import FpsControl from './FpsControl';
import { applyFpsAdjustment } from '../utils/videoUtils';

// Styles as object
const styles = {
  previewContainer: {
    padding: 24,
    marginTop: 16,
    borderRadius: 8,
    background: 'linear-gradient(145deg, #1e1e1e, #262626)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
  emptyContainer: {
    padding: 32,
    textAlign: 'center',
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px dashed rgba(255, 255, 255, 0.2)',
  },
  loaderBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  controlBox: {
    marginBottom: 24,
  },
  divider: {
    margin: '24px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaBox: {
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#000',
    margin: '16px 0',
    padding: 8,
  },
  image: {
    maxWidth: '100%',
    maxHeight: '500px',
    objectFit: 'contain',
  },
  video: {
    maxWidth: '100%',
    maxHeight: '500px',
    borderRadius: 4,
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    maxHeight: '500px',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#000',
    cursor: 'pointer',
  },
  videoElement: {
    width: '100%',
    maxHeight: '500px',
    borderRadius: 4,
    outline: 'none',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
    maxHeight: 'none',
    objectFit: 'contain',
    backgroundColor: '#000',
  },
  fullscreenWrapper: {
    width: '100%',
    height: '100%',
    maxHeight: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    transition: 'opacity 0.3s ease-in-out',
    opacity: 1,
    padding: '10px 8px 8px',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: 'white',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 8px',
  },
  timeDisplay: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.9)',
    minWidth: '60px',
  },
  controlButton: {
    color: 'white',
    padding: '4px',
  },
  progressSlider: {
    color: '#f50057',
    height: 2,
    flex: 1,
    '& .MuiSlider-thumb': {
      width: 8,
      height: 8,
      transition: '0.3s',
      '&:hover': {
        boxShadow: '0 0 0 6px rgba(245, 0, 87, 0.16)',
      },
    },
    '& .MuiSlider-rail': {
      opacity: 0.28,
    },
  },
  audio: {
    width: '100%',
  },
  infoBox: {
    padding: '16px',
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderRadius: 8,
    marginTop: 16,
    border: '1px solid rgba(63, 81, 181, 0.2)',
  },
  detectionMessage: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3f51b5',
  },
  fpsDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: 16,
    marginBottom: 16,
    padding: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  fpsChip: {
    height: 'auto',
    padding: '16px 8px',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: '1.25rem',
  },
  fpsChipOriginal: {
    backgroundColor: '#3f51b5',
    color: 'white',
  },
  fpsChipCurrent: {
    backgroundColor: '#f50057',
    color: 'white',
  },
  fpsLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  speedCircle: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  speedText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  speedLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fileTitle: {
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleIcon: {
    color: '#f50057',
  },
  customFpsInput: {
    marginTop: 16,
    padding: '16px',
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderRadius: 8,
    border: '1px solid rgba(63, 81, 181, 0.2)',
  },
  customFpsField: {
    marginRight: 16,
    width: '120px',
  },
};

const MediaPreviewer = ({ file, onEnterEditMode }) => {
  const [loading, setLoading] = useState(false);
  const [defaultFps, setDefaultFps] = useState(30);
  const [currentFps, setCurrentFps] = useState(30);
  const [customFpsInput, setCustomFpsInput] = useState('30');
  const [fileUrl, setFileUrl] = useState('');
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [mouseIdle, setMouseIdle] = useState(false);
  const videoWrapperRef = useRef(null);
  const hideControlsTimer = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const progressTimer = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Define media type variables early to avoid the initialization error
  const isImage = file?.type?.startsWith('image/') || false;
  const isVideo = file?.type?.startsWith('video/') || false;
  const isAudio = file?.type?.startsWith('audio/') || false;
  
  // Create object URL when file changes and clean up when component unmounts
  useEffect(() => {
    if (file) {
      console.log("File changed in MediaPreviewer:", file.name);
      
      // Create URL for the file
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
      
      // Reset states when file changes
      setIsPlaying(false);
      
      // We don't detect FPS automatically anymore
      // Just keep using the user's custom default FPS
      
      // Cleanup function to revoke the URL when component unmounts
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file]);
  
  // Apply FPS changes when current FPS or video element changes
  useEffect(() => {
    if (videoRef.current && file && file.type.startsWith('video/')) {
      console.log("Applying FPS adjustment:", defaultFps, "to", currentFps);
      applyFpsAdjustment(videoRef.current, defaultFps, currentFps);
    }
  }, [currentFps, videoRef, defaultFps, file]);
  
  const handleFpsChange = (newFps) => {
    setCurrentFps(newFps);
  };

  const handleDefaultFpsChange = (e) => {
    setCustomFpsInput(e.target.value);
  };

  const applyCustomDefaultFps = () => {
    const newDefaultFps = parseFloat(customFpsInput);
    if (!isNaN(newDefaultFps) && newDefaultFps > 0) {
      setDefaultFps(newDefaultFps);
      setCurrentFps(newDefaultFps); // Reset current FPS to the new default
    }
  };

  // Handle mouse movement over video
  const handleMouseMove = () => {
    // Show controls
    setControlsVisible(true);
    setMouseIdle(false);
    
    // Clear any existing timer
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    // Set a new timer to hide controls after 1.5 seconds of inactivity
    hideControlsTimer.current = setTimeout(() => {
      if (!isPlaying) return; // Don't hide controls if video is paused
      setMouseIdle(true);
      setControlsVisible(false);
    }, 1500);
  };
  
  // Ensure controls are visible on initial load
  useEffect(() => {
    if (videoRef.current) {
      setControlsVisible(true);
      
      // Set initial timer to hide controls after video starts playing
      hideControlsTimer.current = setTimeout(() => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      }, 1500);
    }
  }, [fileUrl, isPlaying]);
  
  // Handle video play/pause
  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle video metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Setup progress tracking
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };
    
    if (isPlaying) {
      progressTimer.current = setInterval(updateProgress, 1000);
    }
    
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [isPlaying]);
  
  // Handle seeking
  const handleSeek = (_, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (_, newValue) => {
    if (videoRef.current) {
      setVolume(newValue);
      videoRef.current.volume = newValue;
      setMuted(newValue === 0);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (muted) {
        videoRef.current.muted = false;
        videoRef.current.volume = volume > 0 ? volume : 0.5;
        setVolume(volume > 0 ? volume : 0.5);
      } else {
        videoRef.current.muted = true;
      }
      setMuted(!muted);
    }
  };
  
  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (videoWrapperRef.current) {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          if (videoWrapperRef.current.requestFullscreen) {
            videoWrapperRef.current.requestFullscreen();
          } else if (videoWrapperRef.current.webkitRequestFullscreen) { /* Safari */
            videoWrapperRef.current.webkitRequestFullscreen();
          } else if (videoWrapperRef.current.msRequestFullscreen) { /* IE11 */
            videoWrapperRef.current.msRequestFullscreen();
          }
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Add keyboard controls for the video
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process key events if we have a video loaded
      if (!videoRef.current || !isVideo) return;
      
      // Space: Toggle play/pause
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling with spacebar
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
      
      // F: Toggle fullscreen
      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    
    // Add keyboard listener to window
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isVideo, toggleFullscreen]);

  if (!file) {
    return (
      <Paper elevation={3} style={styles.emptyContainer}>
        <VideoIcon style={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', marginBottom: 16 }} />
        <Typography variant="h6" gutterBottom>
          No Video Selected
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Upload a video file to preview and adjust its FPS
        </Typography>
      </Paper>
    );
  }
  
  // Calculate speed percentage
  const speedPercentage = defaultFps ? ((currentFps/defaultFps)*100).toFixed(0) : 100;
  
  // Determine speed status text
  const getSpeedStatus = () => {
    if (currentFps < defaultFps) {
      return 'SLOW';
    } else if (currentFps > defaultFps) {
      return 'FAST';
    } else {
      return 'NORM';
    }
  };

  // Create the custom video player with auto-hiding controls
  const renderVideoPlayer = () => {
    if (!isVideo || !fileUrl) return null;
    
    return (
      <Box 
        ref={videoWrapperRef}
        style={isFullscreen ? {...styles.videoWrapper, ...styles.fullscreenWrapper} : styles.videoWrapper}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setControlsVisible(true)}
        onMouseLeave={() => {
          if (isPlaying) {
            setControlsVisible(false);
          }
        }}
      >
        <video 
          ref={videoRef}
          src={fileUrl} 
          style={isFullscreen ? styles.fullscreenVideo : styles.videoElement}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false);
            setControlsVisible(true);
          }}
          onLoadedMetadata={handleMetadataLoaded}
          onClick={togglePlayPause}
          onEnded={() => {
            setIsPlaying(false);
            setControlsVisible(true);
          }}
        />
        
        {/* Custom video controls that auto-hide */}
        <Box 
          style={{
            ...styles.videoControls,
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? 'auto' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            style={{...styles.progressSlider, width: '95%', margin: '0 auto'}}
            size="small"
          />
          
          {/* Controls row */}
          <Box style={styles.controlsRow}>
            <IconButton 
              style={styles.controlButton} 
              onClick={togglePlayPause}
              size="small"
            >
              {isPlaying ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
            </IconButton>
            
            <Typography style={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end', gap: '4px' }}>
              <IconButton 
                style={styles.controlButton} 
                onClick={toggleMute}
                size="small"
              >
                {muted ? <MuteIcon fontSize="small" /> : <VolumeIcon fontSize="small" />}
              </IconButton>
              
              <Slider
                value={muted ? 0 : volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
                style={{ ...styles.progressSlider, width: 30 }}
                size="small"
              />
              
              <IconButton 
                style={styles.controlButton} 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                size="small"
              >
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };
  
  return (
    <Paper elevation={5} style={styles.previewContainer}>
      <Box style={{...styles.fileTitle, justifyContent: 'space-between'}}>
        <Box style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <VideoIcon style={styles.titleIcon} />
          <Typography variant="h6" component="div">
            {file.name}
          </Typography>
        </Box>
        {isVideo && onEnterEditMode && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={onEnterEditMode}
          >
            Edit
          </Button>
        )}
      </Box>
      
      {loading && (
        <Box style={styles.loaderBox}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body2" style={{ marginTop: 16 }}>
              Loading video...
            </Typography>
          </Box>
        </Box>
      )}
      
      {file && (
        <Box style={styles.customFpsInput}>
          <Typography variant="subtitle1" gutterBottom>
            Set Default FPS
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Default FPS"
              variant="outlined"
              size="small"
              style={styles.customFpsField}
              value={customFpsInput}
              onChange={handleDefaultFpsChange}
              type="number"
              inputProps={{ min: 1, step: 0.001 }}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={applyCustomDefaultFps}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ResetIcon />}
              onClick={() => {
                setCurrentFps(defaultFps);
              }}
              sx={{ ml: 2 }}
            >
              Reset to Default
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Current default: <strong>{defaultFps}</strong> FPS
          </Typography>
        </Box>
      )}
      
      {isVideo && !loading && (
        <>
          <Box style={styles.fpsDisplay}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={`${defaultFps} FPS`}
                style={{...styles.fpsChip, ...styles.fpsChipOriginal}}
              />
              <Typography style={styles.fpsLabel}>
                DEFAULT
              </Typography>
            </Box>
            
            <Box style={styles.speedCircle}>
              <Typography style={styles.speedText}>{speedPercentage}%</Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={`${currentFps} FPS`}
                style={{...styles.fpsChip, ...styles.fpsChipCurrent}}
              />
              <Typography style={styles.fpsLabel}>
                CURRENT
              </Typography>
            </Box>
          </Box>
        </>
      )}
      
      {isVideo && !loading && (
        <Box style={styles.controlBox}>
          <FpsControl originalFps={defaultFps} onFpsChange={handleFpsChange} />
          <Divider style={styles.divider} />
        </Box>
      )}
      
      <Box style={styles.mediaBox}>
        {isImage && fileUrl && (
          <img 
            src={fileUrl} 
            alt={file.name} 
            style={styles.image} 
          />
        )}

        {isVideo && fileUrl && renderVideoPlayer()}

        {isAudio && fileUrl && (
          <audio 
            src={fileUrl} 
            controls 
            style={styles.audio} 
          />
        )}

        {!fileUrl && (
          <Typography variant="body1" align="center">
            Loading file preview...
          </Typography>
        )}

        {fileUrl && !isImage && !isVideo && !isAudio && (
          <Typography variant="body1">
            This file type cannot be previewed.
          </Typography>
        )}
      </Box>
      
      {isVideo && !loading && (
        <Box style={styles.infoBox}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" align="center">
                <Box component="span" sx={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginRight: '8px'
                }}>
                  {getSpeedStatus()}
                </Box>
                {currentFps < defaultFps 
                  ? `Slowed down to ${speedPercentage}% of default speed`
                  : currentFps > defaultFps
                    ? `Sped up to ${speedPercentage}% of default speed`
                    : 'Playing at default speed (100%)'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" align="center">
                <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Audio pitch changes with playback speed
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default MediaPreviewer; 