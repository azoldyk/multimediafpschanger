import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  },
  scrollContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollThumb: {
    height: '100%',
    backgroundColor: 'rgba(63, 81, 181, 0.6)',
    cursor: 'grab',
    borderRadius: '5px',
  },
};

const TimelineCanvas = ({
  duration,
  playheadPosition,
  onPlayheadMove,
  zoom,
  onZoomChange,
  scroll,
  onScrollChange,
  audioWaveformData,
  isPlaying,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef(null);

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setCanvasSize({ width: clientWidth, height: clientHeight - 10 }); // -10 for scrollbar
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Update canvas dimensions when size changes
  useEffect(() => {
    if (canvasRef.current && canvasSize.width > 0) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasSize.width * dpr;
      canvas.height = canvasSize.height * dpr;
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    }
  }, [canvasSize]);

  // Render timeline
  useEffect(() => {
    if (!canvasRef.current || duration === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvasSize.width;
    const height = canvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate visible duration based on zoom
    const visibleDuration = duration / zoom;
    const pixelsPerSecond = width / visibleDuration;

    // Calculate scroll offset in seconds
    const scrollOffset = (scroll / width) * visibleDuration;

    // Draw time ruler
    drawTimeRuler(ctx, width, height, visibleDuration, scrollOffset, pixelsPerSecond);

    // Draw video track
    drawVideoTrack(ctx, width, height, duration, scrollOffset, visibleDuration);

    // Draw audio waveform
    if (audioWaveformData.length > 0) {
      drawAudioWaveform(ctx, width, height, audioWaveformData, duration, scrollOffset, visibleDuration);
    }

    // Draw playhead
    const playheadX = ((playheadPosition - scrollOffset) / visibleDuration) * width;
    if (playheadX >= 0 && playheadX <= width) {
      drawPlayhead(ctx, playheadX, height);
    }
  }, [duration, playheadPosition, zoom, scroll, audioWaveformData, canvasSize]);

  // Auto-scroll to follow playhead when playing
  useEffect(() => {
    if (!isPlaying) return;

    const updateScroll = () => {
      const visibleDuration = duration / zoom;
      const scrollOffset = (scroll / canvasSize.width) * visibleDuration;
      const scrollEnd = scrollOffset + visibleDuration;

      // Auto-scroll if playhead is near the right edge
      if (playheadPosition > scrollEnd - visibleDuration * 0.1) {
        const newScrollOffset = Math.min(
          playheadPosition - visibleDuration * 0.2,
          duration - visibleDuration
        );
        onScrollChange((newScrollOffset / visibleDuration) * canvasSize.width);
      }

      animationFrameRef.current = requestAnimationFrame(updateScroll);
    };

    animationFrameRef.current = requestAnimationFrame(updateScroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playheadPosition, zoom, scroll, duration, canvasSize.width, onScrollChange]);

  const drawTimeRuler = (ctx, width, height, visibleDuration, scrollOffset, pixelsPerSecond) => {
    const rulerHeight = 30;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, rulerHeight);

    // Determine time increment based on zoom
    let timeIncrement = 1; // seconds
    if (visibleDuration < 10) timeIncrement = 1;
    else if (visibleDuration < 60) timeIncrement = 5;
    else if (visibleDuration < 300) timeIncrement = 10;
    else timeIncrement = 30;

    // Draw time markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';

    const startTime = Math.floor(scrollOffset / timeIncrement) * timeIncrement;
    const endTime = scrollOffset + visibleDuration;

    for (let time = startTime; time <= endTime; time += timeIncrement) {
      const x = ((time - scrollOffset) / visibleDuration) * width;
      if (x >= 0 && x <= width) {
        // Draw tick mark
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x, rulerHeight - 10);
        ctx.lineTo(x, rulerHeight);
        ctx.stroke();

        // Draw time label
        ctx.fillText(formatTime(time), x, 15);
      }
    }

    // Draw minor tick marks
    const minorIncrement = timeIncrement / 5;
    for (let time = startTime; time <= endTime; time += minorIncrement) {
      const x = ((time - scrollOffset) / visibleDuration) * width;
      if (x >= 0 && x <= width) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x, rulerHeight - 5);
        ctx.lineTo(x, rulerHeight);
        ctx.stroke();
      }
    }
  };

  const drawVideoTrack = (ctx, width, height, duration, scrollOffset, visibleDuration) => {
    const trackTop = 35;
    const trackHeight = 60;

    // Background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, trackTop, width, trackHeight);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(0, trackTop, width, trackHeight);

    // Video duration bar
    const videoStartX = ((-scrollOffset) / visibleDuration) * width;
    const videoWidth = (duration / visibleDuration) * width;

    ctx.fillStyle = '#3f51b5';
    ctx.fillRect(
      Math.max(0, videoStartX),
      trackTop,
      Math.min(videoWidth, width - Math.max(0, videoStartX)),
      trackHeight
    );

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Video Track', 10, trackTop + 20);
  };

  const drawAudioWaveform = (ctx, width, height, waveformData, duration, scrollOffset, visibleDuration) => {
    const trackTop = 100;
    const trackHeight = 80;

    // Background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, trackTop, width, trackHeight);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(0, trackTop, width, trackHeight);

    // Draw waveform
    const centerY = trackTop + trackHeight / 2;
    const maxAmplitude = trackHeight / 2 - 5;

    ctx.beginPath();
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 1;

    const samplesPerPixel = waveformData.length / ((duration / visibleDuration) * width);

    for (let x = 0; x < width; x++) {
      const time = scrollOffset + (x / width) * visibleDuration;
      const sampleIndex = Math.floor((time / duration) * waveformData.length);

      if (sampleIndex >= 0 && sampleIndex < waveformData.length) {
        const amplitude = waveformData[sampleIndex] * maxAmplitude;

        if (x === 0) {
          ctx.moveTo(x, centerY - amplitude);
        }
        ctx.lineTo(x, centerY - amplitude);
      }
    }
    ctx.stroke();

    // Draw bottom half (mirror)
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const time = scrollOffset + (x / width) * visibleDuration;
      const sampleIndex = Math.floor((time / duration) * waveformData.length);

      if (sampleIndex >= 0 && sampleIndex < waveformData.length) {
        const amplitude = waveformData[sampleIndex] * maxAmplitude;

        if (x === 0) {
          ctx.moveTo(x, centerY + amplitude);
        }
        ctx.lineTo(x, centerY + amplitude);
      }
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Audio Waveform', 10, trackTop + 15);
  };

  const drawPlayhead = (ctx, x, height) => {
    // Draw vertical line
    ctx.strokeStyle = '#f50057';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    // Draw handle at top
    ctx.fillStyle = '#f50057';
    ctx.beginPath();
    ctx.arc(x, 15, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw arrow at top
    ctx.fillStyle = '#f50057';
    ctx.beginPath();
    ctx.moveTo(x, 25);
    ctx.lineTo(x - 6, 35);
    ctx.lineTo(x + 6, 35);
    ctx.closePath();
    ctx.fill();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, zoom * zoomFactor));
    onZoomChange(newZoom);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMouseMove(e); // Immediately update playhead position
  };

  const handleMouseMove = (e) => {
    if (!isDragging && e.buttons !== 1) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const visibleDuration = duration / zoom;
    const scrollOffset = (scroll / canvasSize.width) * visibleDuration;
    const newTime = scrollOffset + (x / canvasSize.width) * visibleDuration;

    onPlayheadMove(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <Box ref={containerRef} style={styles.container}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      />
    </Box>
  );
};

export default TimelineCanvas;
