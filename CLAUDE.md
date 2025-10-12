# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Custom FPS Video Player** - a React application that allows users to upload video files, set a custom default FPS (frames per second), and dynamically adjust video playback speed by changing the frame rate. The application manipulates the video's playback rate to simulate different FPS values while maintaining audio synchronization.

## Key Commands

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Build for production
npm run build

# Eject from Create React App (one-way operation)
npm run eject
```

## Architecture

### Core Concept
The application doesn't actually detect or change the video file's inherent FPS. Instead, it:
1. Lets users set a "default FPS" baseline (e.g., 30 FPS)
2. Allows adjustment to a "current FPS" (e.g., 60 FPS)
3. Calculates playback rate as `currentFps / defaultFps`
4. Applies this playback rate to the video element to simulate FPS changes

### Component Structure

**`App.js`** (Root Component)
- Sets up MUI dark theme with custom styling
- Manages file selection state
- Renders the main layout with AppBar, MediaPreviewer, and FileUploader
- Location: `src/App.js:152`

**`MediaPreviewer.js`** (Main Video Player)
- Handles video playback with custom controls
- Manages FPS state (defaultFps, currentFps)
- Displays FPS comparison UI and speed indicators
- Implements custom video controls with auto-hide functionality
- Controls visibility based on mouse movement and play state
- Location: `src/components/MediaPreviewer.js:250`

**`FpsControl.js`** (FPS Adjustment Interface)
- Provides slider, text input, and preset buttons for FPS adjustment
- Generates dynamic slider marks based on default FPS (25%, 50%, 100%, 200%, 400%)
- Preset FPS options: 24, 30, 60, 120
- Location: `src/components/FpsControl.js:103`

**`FileUploader.js`** (File Management)
- Drag-and-drop and file browser interface
- Only accepts video files (checks `file.type.startsWith('video/')`)
- Maintains list of uploaded videos
- Location: `src/components/FileUploader.js:123`

### Key Utilities

**`videoUtils.js`**
- `calculatePlaybackRate(defaultFps, targetFps)`: Returns playback rate clamped between 0.1-4.0
- `applyFpsAdjustment(videoElement, defaultFps, targetFps)`: Applies calculated playback rate to video element and sets `preservesPitch` to false for audio pitch changes
- Location: `src/utils/videoUtils.js`

### State Management

The app uses React's `useState` for state management (no Redux/Context API):
- **App level**: `selectedFile` - currently selected video file
- **MediaPreviewer level**:
  - `defaultFps` - user-defined baseline FPS (default: 30)
  - `currentFps` - target FPS for playback
  - Video player state: `isPlaying`, `currentTime`, `duration`, `volume`, `muted`, `isFullscreen`
  - Control visibility: `controlsVisible`, `mouseIdle`

### Video Playback Implementation

The custom video player (MediaPreviewer.js:539-638):
- Uses `videoRef` for direct DOM access
- Auto-hides controls after 1.5s of mouse inactivity when playing
- Keyboard shortcuts: Space (play/pause), F (fullscreen)
- Custom controls overlay with gradient background
- Progress slider, play/pause, volume control, fullscreen button
- Supports fullscreen with cross-browser compatibility

### FPS Adjustment Flow

1. User sets default FPS via text input → `MediaPreviewer.js:312-318`
2. User adjusts current FPS via FpsControl → `FpsControl.js:144-151`
3. FpsControl calls `onFpsChange` callback → `MediaPreviewer.js:304-306`
4. useEffect triggers when currentFps changes → `MediaPreviewer.js:297-302`
5. `applyFpsAdjustment` calculates and applies playback rate → `videoUtils.js:23-44`

## Important Notes

- The working directory is nested: `C:\coding\react\multimediapreviewer\multimediapreviewer`
- This is a Create React App project (react-scripts 5.0.1)
- Uses Material-UI v6 (@mui/material, @emotion/react, @emotion/styled)
- The app does NOT detect actual video FPS from file metadata - users must set their own baseline
- Audio pitch changes with playback speed (`preservesPitch` set to false)
- Object URLs are created for uploaded files and cleaned up on component unmount

## Styling Approach

- MUI dark theme configured in `App.js:24-85`
- Inline styles using style objects (not CSS modules or styled-components)
- Gradient backgrounds and custom shadows throughout
- Custom scrollbar styling in `index.js:21-38`
