import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { timelineReducer, initialTimelineState, TIMELINE_ACTIONS } from '../reducers/timelineReducer';

const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialTimelineState);

  // Track actions
  const addTrack = useCallback((type, name) => {
    dispatch({ type: TIMELINE_ACTIONS.ADD_TRACK, payload: { type, name } });
  }, []);

  const removeTrack = useCallback((trackId) => {
    dispatch({ type: TIMELINE_ACTIONS.REMOVE_TRACK, payload: { trackId } });
  }, []);

  const updateTrack = useCallback((trackId, updates) => {
    dispatch({ type: TIMELINE_ACTIONS.UPDATE_TRACK, payload: { trackId, updates } });
  }, []);

  const reorderTracks = useCallback((trackId, newOrder) => {
    dispatch({ type: TIMELINE_ACTIONS.REORDER_TRACKS, payload: { trackId, newOrder } });
  }, []);

  // Clip actions
  const addClip = useCallback((trackId, clip) => {
    dispatch({ type: TIMELINE_ACTIONS.ADD_CLIP, payload: { trackId, clip } });
  }, []);

  const removeClip = useCallback((clipId) => {
    dispatch({ type: TIMELINE_ACTIONS.REMOVE_CLIP, payload: { clipId } });
  }, []);

  const updateClip = useCallback((clipId, updates) => {
    dispatch({ type: TIMELINE_ACTIONS.UPDATE_CLIP, payload: { clipId, updates } });
  }, []);

  const moveClip = useCallback((clipId, newTrackId, newStartTime) => {
    dispatch({
      type: TIMELINE_ACTIONS.MOVE_CLIP,
      payload: { clipId, newTrackId, newStartTime },
    });
  }, []);

  const splitClip = useCallback((clipId, splitTime) => {
    dispatch({ type: TIMELINE_ACTIONS.SPLIT_CLIP, payload: { clipId, splitTime } });
  }, []);

  // Selection actions
  const selectClip = useCallback((clipId, multiSelect = false) => {
    dispatch({ type: TIMELINE_ACTIONS.SELECT_CLIP, payload: { clipId, multiSelect } });
  }, []);

  const deselectAll = useCallback(() => {
    dispatch({ type: TIMELINE_ACTIONS.DESELECT_ALL });
  }, []);

  // Playback actions
  const setPlayhead = useCallback((time) => {
    dispatch({ type: TIMELINE_ACTIONS.SET_PLAYHEAD, payload: time });
  }, []);

  const setPlaying = useCallback((playing) => {
    dispatch({ type: TIMELINE_ACTIONS.SET_PLAYING, payload: playing });
  }, []);

  // View actions
  const setZoom = useCallback((zoom) => {
    dispatch({ type: TIMELINE_ACTIONS.SET_ZOOM, payload: zoom });
  }, []);

  const setDuration = useCallback((duration) => {
    dispatch({ type: TIMELINE_ACTIONS.SET_DURATION, payload: duration });
  }, []);

  const setSnapping = useCallback((enabled) => {
    dispatch({ type: TIMELINE_ACTIONS.SET_SNAPPING, payload: enabled });
  }, []);

  // Helper functions
  const getClipById = useCallback(
    (clipId) => {
      for (const track of state.tracks) {
        const clip = track.clips.find((c) => c.id === clipId);
        if (clip) return clip;
      }
      return null;
    },
    [state.tracks]
  );

  const getTrackById = useCallback(
    (trackId) => {
      return state.tracks.find((t) => t.id === trackId);
    },
    [state.tracks]
  );

  const value = {
    // State
    ...state,

    // Track actions
    addTrack,
    removeTrack,
    updateTrack,
    reorderTracks,

    // Clip actions
    addClip,
    removeClip,
    updateClip,
    moveClip,
    splitClip,

    // Selection actions
    selectClip,
    deselectAll,

    // Playback actions
    setPlayhead,
    setPlaying,

    // View actions
    setZoom,
    setDuration,
    setSnapping,

    // Helper functions
    getClipById,
    getTrackById,
  };

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};
