# Video Editor Feature Specification

## Overview

This document outlines the new **Video Editor Mode** functionality that will be added to the Custom FPS Video Player application. This feature transforms the simple video player into a timeline-based video editor interface when the user clicks an "Edit" button.

## Feature Goals

Create a professional video editing interface with:
- Timeline-based video scrubbing and preview
- Dynamic zoom and scroll capabilities
- Visual audio waveform display
- FPS controls integrated into the editor view
- Smooth, performant interactions

---

## UI Layout Structure

### Two-Mode System

**View Mode** (Current State)
- The existing video player interface
- Simple preview and playback controls
- FPS adjustment controls

**Edit Mode** (New Feature)
- Triggered by clicking an "Edit" button
- Complete page restructure to editor layout
- Can exit back to View Mode

### Edit Mode Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [FPS Controls]                           [Exit Edit] [Save] │ ← Top Bar
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                                                               │
│                  VIDEO PREVIEW CANVAS                         │ ← Upper Center
│                   (Large Display Area)                        │   Large preview
│                                                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  TIMELINE INTERFACE                                           │ ← Bottom Half
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Time Markers:  0s    1s    2s    3s    4s    5s     │    │   Timeline ruler
│  ├─────────────────────────────────────────────────────┤    │
│  │ ████████████████████████████████████████████████    │    │   Video Track
│  │ [  Video frames preview thumbnails  ]               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿    │    │   Audio Waveform
│  │ [    Audio waveform visualization    ]              │    │
│  └─────────────────────────────────────────────────────┘    │
│  ◄──────────────────────────────────────────────────►       │   Scroll handle
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Edit Mode Toggle
- **Location**: Add "Edit" button to MediaPreviewer or App toolbar
- **Behavior**:
  - Switches entire page layout to editor interface
  - Preserves video file and current FPS settings
  - Initializes timeline and waveform components
  - "Exit Edit" button returns to View Mode

### 2. Video Preview Canvas (Upper Center)
- **Purpose**: Large video preview that updates as user scrubs timeline
- **Size**: Large, center-aligned, prominent display
- **Behavior**:
  - Shows current frame based on timeline playhead position
  - Updates in real-time as user drags playhead
  - Can play video from current position
  - Maintains aspect ratio of original video

### 3. Timeline Interface (Bottom Half)

#### Time Ruler
- **Display**: Horizontal ruler showing time markers (seconds)
- **Behavior**:
  - Dynamically adjusts based on zoom level
  - Shows appropriate time increments (e.g., 1s, 0.5s, 0.1s, 0.01s depending on zoom)
  - Time format: `0s`, `1s`, `2s`, etc. (or `0:00`, `0:01` for longer videos)

#### Video Track
- **Display**: Horizontal track showing video duration
- **Features**:
  - Visual representation of video length
  - Frame thumbnails preview (small preview images spaced along track)
  - Playhead indicator (vertical line showing current position)
  - Click to jump to specific time

#### Audio Waveform Track
- **Display**: Positioned directly below video track
- **Features**:
  - High-quality waveform visualization
  - Shows amplitude variations over time
  - Synchronized with video track
  - Visual representation helps identify audio cues
  - Smooth rendering even at high zoom levels

### 4. FPS Controls (Top Left)
- **Integration**: Same FPS control component from View Mode
- **Position**: Top-left corner of editor interface
- **Features**:
  - Slider, input field, preset buttons
  - Default FPS and Current FPS display
  - Changes affect playback speed in editor

---

## Interactive Features

### Zoom Functionality
- **Trigger**: Mouse scroll wheel over timeline
- **Behavior**:
  - **Scroll Up**: Zoom IN (show more detail, less time visible)
  - **Scroll Down**: Zoom OUT (show less detail, more time visible)
  - Smooth, continuous zoom with easing animation
  - Zoom levels: 10x, 5x, 2x, 1x, 0.5x, 0.1x (relative to full video duration)
  - Center zoom around mouse cursor position or playhead

### Scroll/Pan Functionality
- **Trigger**: Horizontal scroll or drag
- **Behavior**:
  - Pan left/right through timeline when zoomed in
  - Smooth momentum scrolling
  - Scrollbar indicator shows current visible portion
  - Can't scroll beyond video start (0s) or end

### Scrubbing (Timeline Navigation)
- **Trigger**: Click or drag on timeline
- **Behavior**:
  - Click anywhere on timeline to jump to that time
  - Drag playhead to scrub through video
  - Video preview updates in real-time during scrub
  - Smooth, responsive feel (60fps target)
  - Show time tooltip near cursor during scrub

### Playback Control
- **Features**:
  - Play/Pause from current playhead position
  - Playhead moves smoothly during playback
  - Auto-scroll timeline to follow playhead if near edge
  - Can scrub while paused

---

## Technical Implementation Strategy

### State Management
New state requirements for Edit Mode:
- `isEditMode` - Boolean toggle between View/Edit mode
- `timelineZoom` - Current zoom level (0.1 to 10)
- `timelineScroll` - Horizontal scroll position in pixels
- `playheadPosition` - Current time in seconds
- `audioWaveformData` - Array of audio amplitude values
- `videoFrameThumbnails` - Array of thumbnail images for video track

### New Components to Create

1. **`VideoEditor.js`** - Main editor container component
   - Manages edit mode layout
   - Coordinates all sub-components

2. **`TimelineCanvas.js`** - Timeline rendering component
   - Renders time ruler, video track, audio waveform
   - Handles zoom and scroll interactions
   - Uses HTML5 Canvas for performance

3. **`VideoPreviewPanel.js`** - Large video preview
   - Shows current frame
   - Handles playback controls

4. **`Playhead.js`** - Draggable playhead indicator
   - Vertical line on timeline
   - Draggable for scrubbing

5. **`AudioWaveform.js`** - Audio visualization
   - Generates waveform from audio data
   - Renders smooth, high-quality waveform

### Audio Waveform Generation
- **Method**: Use Web Audio API to extract audio data
  1. Decode video audio using `AudioContext`
  2. Get audio buffer channel data
  3. Sample and downsample to create waveform points
  4. Cache waveform data for performance
  5. Render as SVG path or Canvas drawing

### Timeline Rendering Approach
- **Technology**: HTML5 Canvas for performance
- **Optimization**:
  - Only render visible portion of timeline
  - Use requestAnimationFrame for smooth animations
  - Debounce scroll/zoom events
  - Cache rendered frames and waveform segments
  - Implement virtual scrolling for frame thumbnails

### Zoom Implementation
- **Formula**:
  ```
  visibleDuration = totalVideoDuration / zoomLevel
  pixelsPerSecond = canvasWidth / visibleDuration
  ```
- **Smooth Zoom**:
  - Use easing function (e.g., ease-out)
  - Interpolate zoom over 200-300ms
  - Maintain cursor/playhead position during zoom

### Performance Considerations
- Throttle scroll events (60fps target)
- Debounce resize events
- Use Web Workers for waveform generation
- Lazy load frame thumbnails (only generate visible ones)
- Implement canvas pooling for multiple layers
- Use CSS transforms for smooth scrolling (hardware accelerated)

---

## User Workflow

### Entering Edit Mode
1. User uploads video in View Mode
2. Clicks "Edit" button
3. Page transitions to Edit Mode layout
4. Timeline initializes:
   - Audio waveform is generated (show loading indicator)
   - Video track appears with duration
   - Playhead starts at 0s
5. User can now interact with timeline

### Using the Editor
1. **Scrubbing**: Click/drag on timeline to navigate
2. **Zooming**: Scroll wheel to zoom in/out for precision
3. **Playback**: Click play button to preview
4. **FPS Adjustment**: Use top-left controls to change speed
5. **Exit**: Click "Exit Edit" to return to View Mode

---

## Design Requirements

### Visual Style
- Maintain MUI dark theme consistency
- Timeline: Dark gray background (#1e1e1e)
- Waveform: Gradient color (e.g., #3f51b5 to #2196f3)
- Playhead: Bright red (#f50057) vertical line
- Time ruler: Light text on dark background
- Video track: Subtle border, darker fill
- Hover effects: Lighten on hover

### Responsiveness
- Timeline takes full width of container
- Minimum timeline height: 200px
- Video preview scales to fit container
- Mobile: Consider simplified timeline view
- Maintain 16:9 or original aspect ratio for preview

### Smooth Animations
- Zoom transitions: 250ms ease-out
- Playhead movement: 60fps smooth motion
- Scroll momentum: Natural physics-based easing
- Waveform rendering: No jank or stutter

---

## Phase 1 Implementation Checklist

### Essential Features (MVP)
- ✓ Edit mode toggle button
- ✓ Page layout restructure for editor view
- ✓ Large video preview panel
- ✓ Basic timeline with time ruler
- ✓ Video track visualization
- ✓ Audio waveform generation and display
- ✓ Playhead indicator
- ✓ Click-to-seek functionality
- ✓ Scroll wheel zoom in/out
- ✓ Horizontal scroll/pan
- ✓ Real-time preview updates during scrub
- ✓ FPS controls integration
- ✓ Smooth animations and transitions

### Nice-to-Have (Future Enhancements)
- Frame thumbnail previews on video track
- Keyboard shortcuts (spacebar for play/pause, arrow keys for frame-by-frame)
- Timeline markers and regions
- Undo/redo functionality
- Export functionality
- Multiple video tracks
- Trimming and cutting tools

---

## Technical Dependencies

### New Libraries to Consider
- **Waveform Generation**:
  - `wavesurfer.js` - Full-featured waveform library (heavy)
  - OR custom implementation with Web Audio API (lighter)

- **Timeline Rendering**:
  - Custom Canvas implementation (recommended)
  - OR `react-konva` - React Canvas library

- **Smooth Scrolling**:
  - Native browser scrolling with CSS
  - OR `react-spring` for physics-based animations

### Browser APIs Required
- Web Audio API - for waveform generation
- Canvas API - for timeline rendering
- Video API - for frame extraction
- RequestAnimationFrame - for smooth updates

---

## Success Criteria

The Video Editor Mode is successful when:
1. ✓ User can seamlessly toggle between View and Edit modes
2. ✓ Timeline zoom is smooth and responsive (no jank)
3. ✓ Audio waveform displays clearly and accurately
4. ✓ Scrubbing updates video preview in real-time
5. ✓ All interactions feel native and professional
6. ✓ Performance remains smooth even for long videos (10+ minutes)
7. ✓ FPS controls work correctly in Edit Mode

---

## Next Steps

1. Review and approve this specification
2. Set up basic Edit Mode layout structure
3. Implement timeline canvas with time ruler
4. Add audio waveform generation
5. Implement zoom and scroll functionality
6. Add playhead and scrubbing
7. Connect video preview updates
8. Polish animations and performance
9. User testing and refinement

---

**Note**: This is a foundational feature that opens the door for future video editing capabilities like trimming, cutting, effects, and export functionality.
