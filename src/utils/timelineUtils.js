import { SNAP_THRESHOLD } from '../constants/timelineConstants';

/**
 * Generate a unique ID for clips and tracks
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Convert pixel position to time in seconds
 */
export const pixelsToTime = (pixels, zoom) => {
  return pixels / zoom;
};

/**
 * Convert time in seconds to pixel position
 */
export const timeToPixels = (time, zoom) => {
  return time * zoom;
};

/**
 * Format time in seconds to MM:SS.ms format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

/**
 * Snap time to nearest snap point (clips, playhead, markers)
 */
export const snapToNearestPoint = (timePosition, snapPoints, zoom, enabled = true) => {
  if (!enabled) return timePosition;

  const closest = snapPoints.reduce((prev, curr) =>
    Math.abs(curr - timePosition) < Math.abs(prev - timePosition) ? curr : prev
  );

  const pixelDistance = Math.abs(closest - timePosition) * zoom;
  return pixelDistance < SNAP_THRESHOLD ? closest : timePosition;
};

/**
 * Get all snap points from timeline state
 */
export const getSnapPoints = (tracks, playhead, duration) => {
  const points = [0, duration, playhead];

  tracks.forEach((track) => {
    track.clips.forEach((clip) => {
      points.push(clip.startTime);
      points.push(clip.startTime + clip.duration);
    });
  });

  return points;
};

/**
 * Check if two time ranges overlap
 */
export const doClipsOverlap = (clip1, clip2) => {
  const clip1End = clip1.startTime + clip1.duration;
  const clip2End = clip2.startTime + clip2.duration;

  return !(clip1End <= clip2.startTime || clip2End <= clip1.startTime);
};

/**
 * Find clip at position
 */
export const findClipAtPosition = (track, timePosition) => {
  return track.clips.find(
    (clip) =>
      timePosition >= clip.startTime && timePosition < clip.startTime + clip.duration
  );
};

/**
 * Calculate track order from Y position
 */
export const calculateTrackFromY = (yPosition, tracks, trackHeight) => {
  const trackIndex = Math.floor(yPosition / trackHeight);
  return trackIndex >= 0 && trackIndex < tracks.length ? tracks[trackIndex] : null;
};

/**
 * Clamp value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Get timeline ruler markers based on zoom level
 */
export const getTimelineMarkers = (duration, zoom, width) => {
  const markers = [];

  // Determine marker interval based on zoom
  let interval;
  if (zoom > 200) {
    interval = 0.1; // 100ms
  } else if (zoom > 100) {
    interval = 0.5; // 500ms
  } else if (zoom > 50) {
    interval = 1; // 1 second
  } else if (zoom > 20) {
    interval = 5; // 5 seconds
  } else if (zoom > 10) {
    interval = 10; // 10 seconds
  } else {
    interval = 30; // 30 seconds
  }

  for (let time = 0; time <= Math.ceil(duration); time += interval) {
    markers.push({
      time,
      position: timeToPixels(time, zoom),
      label: formatTime(time),
      isMajor: time % (interval * 5) === 0, // Every 5th marker is major
    });
  }

  return markers;
};

/**
 * Calculate visible time range based on scroll position
 */
export const getVisibleTimeRange = (scrollLeft, width, zoom) => {
  const startTime = pixelsToTime(scrollLeft, zoom);
  const endTime = pixelsToTime(scrollLeft + width, zoom);
  return { startTime, endTime };
};

/**
 * Extract video frame as thumbnail at specific time
 */
export const extractVideoFrame = (videoElement, time) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const video = videoElement.cloneNode();
    video.currentTime = time;

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      });
    };

    video.onerror = reject;
    video.load();
  });
};
