# Video Editor Timeline Architecture

## Overview

This document outlines the architecture for implementing a full-featured video editor timeline interface similar to modern video editing applications (Premiere Pro, DaVinci Resolve, Final Cut Pro). The timeline will support multi-track video and audio editing with drag-and-drop capabilities, clip manipulation, and non-linear editing workflows.

---

## Core Concepts

### Timeline Structure

The timeline is a **time-based canvas** where media clips are positioned on multiple parallel tracks. Each track represents a layer in the final composition, with higher tracks rendering on top of lower tracks.

```
Time (seconds) →  0s      5s      10s     15s     20s
─────────────────────────────────────────────────────
Video Track 3:           [Clip C]
Video Track 2:   [Clip A]        [Clip B]
Video Track 1:   [Clip D──────────────────]
─────────────────────────────────────────────────────
Audio Track 1:   [Audio A]       [Audio B]
Audio Track 2:           [Music Track────────]
```

### Key Components Architecture

```
TimelineEditor (Parent Container)
├── TimelineHeader
│   ├── Toolbar (tools: select, cut, move, etc.)
│   ├── PlaybackControls
│   └── TimeDisplay
├── TracksContainer
│   ├── TrackHeader (for each track)
│   │   ├── TrackControls (mute, solo, lock)
│   │   └── TrackLabel
│   └── TrackLane (for each track)
│       ├── TimelineClip (for each clip)
│       │   ├── ClipThumbnail
│       │   ├── ClipLabel
│       │   ├── TrimHandles
│       │   └── ClipWaveform (audio)
│       └── DropZone
├── TimelineRuler (time markers)
├── Playhead (current time indicator)
└── TimelineFooter
    ├── ZoomControls
    └── AddTrackButton
```

---

## State Management

### Global Timeline State

```javascript
// TimelineState structure
{
  tracks: [
    {
      id: 'track-uuid-1',
      type: 'video', // 'video' or 'audio'
      name: 'Video Track 1',
      order: 0, // vertical position
      locked: false,
      muted: false,
      solo: false,
      height: 80, // pixels
      clips: [
        {
          id: 'clip-uuid-1',
          file: File, // or ObjectURL
          startTime: 0, // timeline position in seconds
          duration: 5.5, // visible duration in seconds
          trimStart: 0, // trim from original start
          trimEnd: 0, // trim from original end
          originalDuration: 5.5, // file's actual duration
          volume: 1.0, // 0-1
          effects: [], // array of effect objects
          transitions: { in: null, out: null },
          thumbnail: 'blob:...', // preview image
          waveform: [...], // audio waveform data
          selected: false,
          trackId: 'track-uuid-1'
        }
      ]
    }
  ],
  playhead: 0, // current playback position in seconds
  duration: 30, // total timeline duration
  zoom: 1, // pixels per second
  selectedClips: ['clip-uuid-1'], // array of selected clip IDs
  clipboard: null, // for copy/paste
  history: [], // undo/redo stack
  playing: false,
  snapping: true, // snap to grid/clips
}
```

### State Management Approach

Given your current architecture uses `useState`, consider:

1. **Context API** - For timeline-wide state (recommended)
   - `TimelineContext` providing state and actions
   - Reduces prop drilling
   - Located: `src/contexts/TimelineContext.js`

2. **Reducer Pattern** - For complex timeline operations
   - `useReducer` for timeline state management
   - Actions: ADD_CLIP, MOVE_CLIP, SPLIT_CLIP, DELETE_CLIP, etc.
   - Located: `src/reducers/timelineReducer.js`

---

## Core Functionalities

### 1. Clip Selection & Manipulation

**Selection**
```javascript
// Single click: select clip
// Cmd/Ctrl + click: multi-select
// Drag marquee: area select
// Keyboard: Tab to cycle selection

const handleClipClick = (clipId, event) => {
  if (event.metaKey || event.ctrlKey) {
    // Add to selection
    setSelectedClips(prev =>
      prev.includes(clipId)
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  } else {
    // Replace selection
    setSelectedClips([clipId]);
  }
};
```

**Movement**
```javascript
// Drag selected clips horizontally (time) or vertically (tracks)
const handleClipDrag = (clipId, deltaX, deltaY) => {
  const timelineDelta = deltaX / zoom; // convert pixels to seconds
  const trackDelta = Math.round(deltaY / trackHeight);

  // Move clip(s) with snapping
  moveClips(selectedClips, {
    timeDelta: snapToGrid(timelineDelta),
    trackDelta: trackDelta
  });
};
```

### 2. Cutting & Trimming

**Split/Cut Tool**
```javascript
// Cut clip at playhead position or click position
const splitClipAt = (clipId, timePosition) => {
  const clip = findClip(clipId);
  const splitPoint = timePosition - clip.startTime;

  if (splitPoint <= 0 || splitPoint >= clip.duration) return;

  const leftClip = {
    ...clip,
    id: generateUUID(),
    duration: splitPoint,
    trimEnd: clip.trimEnd + (clip.duration - splitPoint)
  };

  const rightClip = {
    ...clip,
    id: generateUUID(),
    startTime: timePosition,
    duration: clip.duration - splitPoint,
    trimStart: clip.trimStart + splitPoint
  };

  replaceClip(clip.id, [leftClip, rightClip]);
};
```

**Trim Handles**
```javascript
// Drag handles on clip edges to trim in/out points
const handleTrimDrag = (clipId, edge, deltaX) => {
  const timeDelta = deltaX / zoom;

  if (edge === 'start') {
    // Move start time and adjust trim
    updateClip(clipId, {
      startTime: clip.startTime + timeDelta,
      duration: clip.duration - timeDelta,
      trimStart: clip.trimStart + timeDelta
    });
  } else {
    // Adjust end time and trim
    updateClip(clipId, {
      duration: clip.duration + timeDelta,
      trimEnd: clip.trimEnd - timeDelta
    });
  }
};
```

### 3. Multi-Track Management

**Track Operations**
```javascript
// Add new track
const addTrack = (type) => {
  const newTrack = {
    id: generateUUID(),
    type: type, // 'video' or 'audio'
    name: `${type} Track ${tracks.filter(t => t.type === type).length + 1}`,
    order: tracks.length,
    locked: false,
    muted: false,
    solo: false,
    height: type === 'video' ? 80 : 60,
    clips: []
  };
  setTracks([...tracks, newTrack]);
};

// Reorder tracks (drag track headers)
const reorderTrack = (trackId, newOrder) => {
  setTracks(prev => {
    const updated = [...prev];
    const trackIndex = updated.findIndex(t => t.id === trackId);
    const [track] = updated.splice(trackIndex, 1);
    updated.splice(newOrder, 0, track);
    return updated.map((t, idx) => ({ ...t, order: idx }));
  });
};

// Track controls
const toggleTrackMute = (trackId) => {
  updateTrack(trackId, { muted: !track.muted });
};

const toggleTrackLock = (trackId) => {
  updateTrack(trackId, { locked: !track.locked });
};
```

### 4. Drag & Drop System

**Drop Zones**
```javascript
// Accept files from FileUploader or existing clips
const handleDrop = (event, trackId, timePosition) => {
  event.preventDefault();

  const files = event.dataTransfer.files;
  const clipData = event.dataTransfer.getData('clip');

  if (clipData) {
    // Moving existing clip
    const clip = JSON.parse(clipData);
    moveClipToTrack(clip.id, trackId, timePosition);
  } else if (files.length > 0) {
    // Adding new clip from file
    Array.from(files).forEach((file, index) => {
      addClipToTrack(trackId, file, timePosition + index * 0.1);
    });
  }
};
```

### 5. Playback & Rendering

**Composite Rendering**
```javascript
// Render visible clips at current playhead position
const renderFrame = (playheadTime) => {
  const videoTracks = tracks.filter(t => t.type === 'video');
  const audioTracks = tracks.filter(t => t.type === 'audio');

  // Find active clips at playhead position
  const activeVideoClips = videoTracks
    .flatMap(track => track.clips)
    .filter(clip =>
      playheadTime >= clip.startTime &&
      playheadTime < clip.startTime + clip.duration &&
      !clip.trackLocked &&
      !clip.trackMuted
    )
    .sort((a, b) => a.trackOrder - b.trackOrder); // bottom to top

  // Render video layers (use Canvas API or WebGL)
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  activeVideoClips.forEach(clip => {
    const localTime = playheadTime - clip.startTime + clip.trimStart;
    drawClipFrame(ctx, clip, localTime);
  });

  // Mix audio tracks
  activeAudioClips.forEach(clip => {
    const localTime = playheadTime - clip.startTime + clip.trimStart;
    mixAudioClip(clip, localTime);
  });
};
```

---

## Design Patterns & Best Practices

### Performance Optimization

1. **Virtualization**
   - Only render visible timeline region
   - Use `react-window` or custom virtualization for long timelines
   - Location: `src/components/timeline/VirtualizedTimeline.js`

2. **Memoization**
   ```javascript
   // Memoize clip components to prevent unnecessary re-renders
   const TimelineClip = React.memo(({ clip, onSelect, onDrag }) => {
     // Component implementation
   }, (prevProps, nextProps) => {
     return prevProps.clip.id === nextProps.clip.id &&
            prevProps.clip.selected === nextProps.clip.selected &&
            prevProps.clip.startTime === nextProps.clip.startTime;
   });
   ```

3. **Thumbnail Generation**
   - Generate thumbnails on file upload (Web Workers)
   - Cache in IndexedDB for persistence
   - Use video `seeked` event for frame extraction

4. **Waveform Generation**
   - Use Web Audio API to analyze audio
   - Generate once, cache as array of peak values
   - Location: `src/utils/audioAnalyzer.js`

### Interaction Patterns

**Snapping System**
```javascript
const SNAP_THRESHOLD = 10; // pixels

const snapToNearestPoint = (timePosition) => {
  if (!snappingEnabled) return timePosition;

  const snapPoints = [
    0, // timeline start
    duration, // timeline end
    playhead, // current playhead
    ...clips.flatMap(c => [c.startTime, c.startTime + c.duration])
  ];

  const closest = snapPoints.reduce((prev, curr) =>
    Math.abs(curr - timePosition) < Math.abs(prev - timePosition)
      ? curr : prev
  );

  const pixelDistance = Math.abs(closest - timePosition) * zoom;
  return pixelDistance < SNAP_THRESHOLD ? closest : timePosition;
};
```

**Keyboard Shortcuts**
```javascript
// Implement in TimelineEditor component
const keyboardShortcuts = {
  'Space': togglePlayback,
  'Delete': deleteSelectedClips,
  'Cmd+C': copySelectedClips,
  'Cmd+V': pasteClips,
  'Cmd+Z': undo,
  'Cmd+Shift+Z': redo,
  'C': activateCutTool,
  'V': activateSelectTool,
  'A': selectAllClips,
  'Home': seekToStart,
  'End': seekToEnd,
  'I': markIn,
  'O': markOut,
  '[': trimToPlayhead,
  ']': trimFromPlayhead,
};
```

### Styling Approach

Following your existing MUI dark theme pattern:

```javascript
const timelineStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#0a0a0a',
    color: '#fff',
  },
  tracksContainer: {
    display: 'flex',
    overflow: 'auto',
    flex: 1,
  },
  trackLane: {
    position: 'relative',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    minHeight: 80,
    background: 'linear-gradient(to bottom, #1a1a1a, #141414)',
  },
  clip: {
    position: 'absolute',
    backgroundColor: 'rgba(100, 200, 255, 0.3)',
    border: '2px solid rgba(100, 200, 255, 0.8)',
    borderRadius: 4,
    cursor: 'grab',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: '0 0 10px rgba(100, 200, 255, 0.6)',
    },
    '&.selected': {
      border: '2px solid #64C8FF',
      boxShadow: '0 0 15px rgba(100, 200, 255, 0.8)',
    },
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ff4444',
    zIndex: 1000,
    pointerEvents: 'none',
  },
};
```

---

## Component File Structure

```
src/
├── components/
│   ├── timeline/
│   │   ├── TimelineEditor.js           // Main container
│   │   ├── TimelineHeader.js           // Toolbar & controls
│   │   ├── TimelineRuler.js            // Time markers
│   │   ├── TracksContainer.js          // Scrollable tracks area
│   │   ├── Track.js                    // Individual track
│   │   ├── TrackHeader.js              // Track controls (mute, solo, lock)
│   │   ├── TrackLane.js                // Drop zone for clips
│   │   ├── TimelineClip.js             // Draggable clip component
│   │   ├── TrimHandle.js               // Edge trim controls
│   │   ├── Playhead.js                 // Current time indicator
│   │   └── ZoomControls.js             // Timeline zoom slider
│   ├── MediaPreviewer.js               // (existing) Preview window
│   ├── FpsControl.js                   // (existing)
│   └── FileUploader.js                 // (existing) Source media
├── contexts/
│   └── TimelineContext.js              // Global timeline state
├── reducers/
│   └── timelineReducer.js              // State management logic
├── hooks/
│   ├── useTimelinePlayback.js          // Playback control logic
│   ├── useClipSelection.js             // Selection management
│   └── useClipDragDrop.js              // Drag and drop handling
├── utils/
│   ├── videoUtils.js                   // (existing) FPS utilities
│   ├── timelineUtils.js                // Timeline calculations
│   ├── audioAnalyzer.js                // Waveform generation
│   ├── thumbnailGenerator.js           // Video frame extraction
│   └── compositeRenderer.js            // Multi-track rendering
└── constants/
    └── timelineConstants.js            // Track heights, colors, etc.
```

---

## Integration with Existing Codebase

### Connecting to Current Components

**App.js** (Root level integration)
```javascript
// Add timeline route/view
const [viewMode, setViewMode] = useState('player'); // 'player' or 'editor'

return (
  <ThemeProvider theme={darkTheme}>
    <Box sx={styles.container}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Custom FPS Video Player</Typography>
          <ButtonGroup>
            <Button onClick={() => setViewMode('player')}>Player</Button>
            <Button onClick={() => setViewMode('editor')}>Editor</Button>
          </ButtonGroup>
        </Toolbar>
      </AppBar>

      {viewMode === 'player' ? (
        <MediaPreviewer file={selectedFile} />
      ) : (
        <TimelineEditor files={uploadedFiles} />
      )}

      <FileUploader onFileSelect={handleFileSelect} />
    </Box>
  </ThemeProvider>
);
```

**MediaPreviewer.js** (Use as preview window)
- Keep existing video player as timeline preview
- Sync playhead position with timeline state
- Render composite output from multiple tracks

**FpsControl.js** (Per-clip FPS adjustment)
- Apply FPS control to individual clips
- Store FPS settings in clip metadata

---

## Advanced Features

### Transitions
```javascript
// Crossfade between clips
const applyTransition = (clip1, clip2, duration) => {
  return {
    type: 'crossfade',
    duration: duration, // seconds
    curve: 'linear', // or 'ease-in', 'ease-out'
  };
};
```

### Effects Pipeline
```javascript
// Apply effects to clips (brightness, contrast, filters)
const clipEffects = [
  { type: 'brightness', value: 1.2 },
  { type: 'contrast', value: 1.1 },
  { type: 'blur', radius: 2 },
];
```

### Markers & Regions
```javascript
// Add markers to timeline
const markers = [
  { time: 5.5, label: 'Scene 1', color: '#ff0000' },
  { time: 12.3, label: 'Transition', color: '#00ff00' },
];
```

---

## Technical Challenges & Solutions

### Challenge 1: Real-time Preview Performance
**Solution**: Use requestAnimationFrame for smooth playback, offload rendering to Web Workers, implement frame-skipping for slow hardware

### Challenge 2: Multi-track Audio Mixing
**Solution**: Use Web Audio API `AudioContext` with `GainNode` per track, implement audio buffering for seamless playback

### Challenge 3: Large File Handling
**Solution**: Stream video files instead of loading entirely, use IndexedDB for metadata caching, implement progressive loading

### Challenge 4: Undo/Redo System
**Solution**: Implement command pattern for all timeline operations, maintain history stack with state snapshots (limit to 50 actions)

### Challenge 5: Responsive Timeline Zoom
**Solution**: Use CSS transforms for zoom scaling, implement mini-map navigator for long timelines, cache rendered regions

---

## Implementation Phases

### Phase 1: Basic Timeline Structure
- Create timeline layout with single track
- Implement clip rendering with position/duration
- Add playhead and timeline ruler
- Basic drag-to-move functionality

### Phase 2: Multi-track Support
- Add track creation/deletion
- Implement vertical drag between tracks
- Track controls (mute, lock, solo)
- Track reordering

### Phase 3: Clip Manipulation
- Trim handles and trimming logic
- Split/cut tool
- Multi-select and group operations
- Copy/paste functionality

### Phase 4: Enhanced Features
- Waveform visualization
- Thumbnail generation and display
- Snapping system
- Keyboard shortcuts

### Phase 5: Playback & Rendering
- Composite video rendering
- Audio mixing
- Export functionality
- Performance optimization

---

## Reference Implementation Patterns

For similar open-source projects to reference:
- **react-timeline-editor** - Timeline component patterns
- **remotion** - Programmatic video composition
- **kdenlive** - Non-linear video editor architecture
- **wavesurfer.js** - Audio waveform visualization

---

## Conclusion

This architecture provides a scalable foundation for a professional-grade video editor timeline. The modular component structure allows incremental implementation, starting with basic clip positioning and progressively adding advanced features. By leveraging your existing React/MUI setup and video playback infrastructure, you can build this timeline editor while maintaining consistency with the current codebase design patterns.

Key priorities:
1. **Performance**: Virtualization, memoization, Web Workers
2. **UX**: Smooth drag-and-drop, visual feedback, keyboard shortcuts
3. **Flexibility**: Support for arbitrary track counts and clip arrangements
4. **Extensibility**: Plugin architecture for effects and transitions

Implementation time estimate: 4-6 weeks for Phase 1-3, additional 2-3 weeks for Phase 4-5 with polish.
