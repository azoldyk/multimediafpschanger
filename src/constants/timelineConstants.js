// Timeline visual constants
export const TRACK_HEIGHTS = {
  VIDEO: 80,
  AUDIO: 60,
};

export const TIMELINE_COLORS = {
  background: '#0a0a0a',
  trackLane: '#1a1a1a',
  trackBorder: 'rgba(255,255,255,0.1)',
  clipVideo: 'rgba(100, 200, 255, 0.3)',
  clipAudio: 'rgba(100, 255, 150, 0.3)',
  clipBorder: 'rgba(100, 200, 255, 0.8)',
  clipBorderSelected: '#64C8FF',
  clipBorderAudio: 'rgba(100, 255, 150, 0.8)',
  playhead: '#ff4444',
  waveform: ['#3f51b5', '#2196f3'],
  ruler: 'rgba(255,255,255,0.6)',
  rulerLine: 'rgba(255,255,255,0.2)',
};

// Timeline interaction constants
export const SNAP_THRESHOLD = 10; // pixels
export const MIN_CLIP_DURATION = 0.1; // seconds
export const MAX_PLAYBACK_RATE = 4.0;
export const MIN_PLAYBACK_RATE = 0.1;

// Zoom levels
export const ZOOM_LEVELS = {
  MIN: 0.1, // 10 seconds = 1 pixel
  MAX: 10,  // 1 second = 10 pixels
  DEFAULT: 50, // 1 second = 50 pixels (starting zoom)
  STEP: 1.2, // zoom multiplier per scroll
};

// Timeline defaults
export const DEFAULT_TIMELINE_DURATION = 30; // seconds
export const DEFAULT_FPS = 30;

// Track types
export const TRACK_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
};

// Tool types
export const TOOLS = {
  SELECT: 'select',
  CUT: 'cut',
  TRIM: 'trim',
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  DELETE: 'Delete',
  COPY: 'c',
  PASTE: 'v',
  UNDO: 'z',
  REDO: 'Z',
  SELECT_ALL: 'a',
  CUT_TOOL: 'c',
  SELECT_TOOL: 'v',
  ZOOM_IN: '=',
  ZOOM_OUT: '-',
};
