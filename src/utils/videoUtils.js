// This file contains utility functions for video playback

/**
 * Calculates the playback rate needed to achieve the desired FPS
 * @param {number} defaultFps - The default FPS set by the user
 * @param {number} targetFps - The target FPS to play at
 * @returns {number} - The playback rate to set on the video element
 */
export const calculatePlaybackRate = (defaultFps, targetFps) => {
  if (!defaultFps || !targetFps) return 1.0;
  
  // Constrain the result between 0.1 and 4.0 (common browser limits)
  const rate = targetFps / defaultFps;
  return Math.max(0.1, Math.min(4.0, rate));
};

/**
 * Applies FPS adjustment to a video element
 * @param {HTMLVideoElement} videoElement - The video element to adjust
 * @param {number} defaultFps - The default FPS set by the user
 * @param {number} targetFps - The target FPS to play at
 */
export const applyFpsAdjustment = (videoElement, defaultFps, targetFps) => {
  if (!videoElement) return;
  
  const rate = calculatePlaybackRate(defaultFps, targetFps);
  
  // Apply the calculated playback rate
  videoElement.playbackRate = rate;
  
  // We need to preserve audio pitch when changing speed
  try {
    // Not all browsers support these properties
    if ('preservesPitch' in videoElement) {
      videoElement.preservesPitch = false;
    } else if ('mozPreservesPitch' in videoElement) {
      videoElement.mozPreservesPitch = false;
    } else if ('webkitPreservesPitch' in videoElement) {
      videoElement.webkitPreservesPitch = false;
    }
  } catch (e) {
    console.warn('Error changing audio pitch preservation:', e);
  }
}; 