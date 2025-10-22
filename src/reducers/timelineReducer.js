import { generateUUID } from '../utils/timelineUtils';

// Action types
export const TIMELINE_ACTIONS = {
  ADD_TRACK: 'ADD_TRACK',
  REMOVE_TRACK: 'REMOVE_TRACK',
  UPDATE_TRACK: 'UPDATE_TRACK',
  REORDER_TRACKS: 'REORDER_TRACKS',
  ADD_CLIP: 'ADD_CLIP',
  REMOVE_CLIP: 'REMOVE_CLIP',
  UPDATE_CLIP: 'UPDATE_CLIP',
  MOVE_CLIP: 'MOVE_CLIP',
  SPLIT_CLIP: 'SPLIT_CLIP',
  SELECT_CLIP: 'SELECT_CLIP',
  DESELECT_ALL: 'DESELECT_ALL',
  SET_PLAYHEAD: 'SET_PLAYHEAD',
  SET_ZOOM: 'SET_ZOOM',
  SET_DURATION: 'SET_DURATION',
  SET_PLAYING: 'SET_PLAYING',
  SET_SNAPPING: 'SET_SNAPPING',
  UNDO: 'UNDO',
  REDO: 'REDO',
};

// Initial state
export const initialTimelineState = {
  tracks: [],
  playhead: 0,
  duration: 30,
  zoom: 50, // pixels per second
  selectedClips: [],
  playing: false,
  snapping: true,
  history: [],
  historyIndex: -1,
};

// Timeline reducer
export const timelineReducer = (state, action) => {
  switch (action.type) {
    case TIMELINE_ACTIONS.ADD_TRACK: {
      const { type, name } = action.payload;
      const newTrack = {
        id: generateUUID(),
        type,
        name: name || `${type} Track ${state.tracks.filter((t) => t.type === type).length + 1}`,
        order: state.tracks.length,
        locked: false,
        muted: false,
        solo: false,
        height: type === 'video' ? 80 : 60,
        clips: [],
      };
      return { ...state, tracks: [...state.tracks, newTrack] };
    }

    case TIMELINE_ACTIONS.REMOVE_TRACK: {
      const { trackId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== trackId),
      };
    }

    case TIMELINE_ACTIONS.UPDATE_TRACK: {
      const { trackId, updates } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === trackId ? { ...track, ...updates } : track
        ),
      };
    }

    case TIMELINE_ACTIONS.REORDER_TRACKS: {
      const { trackId, newOrder } = action.payload;
      const tracks = [...state.tracks];
      const trackIndex = tracks.findIndex((t) => t.id === trackId);
      const [track] = tracks.splice(trackIndex, 1);
      tracks.splice(newOrder, 0, track);
      return {
        ...state,
        tracks: tracks.map((t, idx) => ({ ...t, order: idx })),
      };
    }

    case TIMELINE_ACTIONS.ADD_CLIP: {
      const { trackId, clip } = action.payload;
      const newClip = {
        id: generateUUID(),
        ...clip,
        trackId,
        selected: false,
      };
      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === trackId
            ? { ...track, clips: [...track.clips, newClip] }
            : track
        ),
      };
    }

    case TIMELINE_ACTIONS.REMOVE_CLIP: {
      const { clipId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map((track) => ({
          ...track,
          clips: track.clips.filter((c) => c.id !== clipId),
        })),
        selectedClips: state.selectedClips.filter((id) => id !== clipId),
      };
    }

    case TIMELINE_ACTIONS.UPDATE_CLIP: {
      const { clipId, updates } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) =>
            clip.id === clipId ? { ...clip, ...updates } : clip
          ),
        })),
      };
    }

    case TIMELINE_ACTIONS.MOVE_CLIP: {
      const { clipId, newTrackId, newStartTime } = action.payload;

      // Find the clip
      let clipToMove = null;
      let oldTrackId = null;

      state.tracks.forEach((track) => {
        const clip = track.clips.find((c) => c.id === clipId);
        if (clip) {
          clipToMove = clip;
          oldTrackId = track.id;
        }
      });

      if (!clipToMove) return state;

      // Remove from old track and add to new track
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          if (track.id === oldTrackId) {
            return {
              ...track,
              clips: track.clips.filter((c) => c.id !== clipId),
            };
          } else if (track.id === newTrackId) {
            return {
              ...track,
              clips: [
                ...track.clips,
                { ...clipToMove, startTime: newStartTime, trackId: newTrackId },
              ],
            };
          }
          return track;
        }),
      };
    }

    case TIMELINE_ACTIONS.SPLIT_CLIP: {
      const { clipId, splitTime } = action.payload;

      let clipToSplit = null;
      let trackId = null;

      state.tracks.forEach((track) => {
        const clip = track.clips.find((c) => c.id === clipId);
        if (clip) {
          clipToSplit = clip;
          trackId = track.id;
        }
      });

      if (!clipToSplit) return state;

      const splitPoint = splitTime - clipToSplit.startTime;

      if (splitPoint <= 0 || splitPoint >= clipToSplit.duration) return state;

      const leftClip = {
        ...clipToSplit,
        id: generateUUID(),
        duration: splitPoint,
        trimEnd: clipToSplit.trimEnd + (clipToSplit.duration - splitPoint),
      };

      const rightClip = {
        ...clipToSplit,
        id: generateUUID(),
        startTime: splitTime,
        duration: clipToSplit.duration - splitPoint,
        trimStart: clipToSplit.trimStart + splitPoint,
      };

      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                clips: [
                  ...track.clips.filter((c) => c.id !== clipId),
                  leftClip,
                  rightClip,
                ],
              }
            : track
        ),
      };
    }

    case TIMELINE_ACTIONS.SELECT_CLIP: {
      const { clipId, multiSelect } = action.payload;

      if (multiSelect) {
        const isSelected = state.selectedClips.includes(clipId);
        return {
          ...state,
          selectedClips: isSelected
            ? state.selectedClips.filter((id) => id !== clipId)
            : [...state.selectedClips, clipId],
        };
      }

      return {
        ...state,
        selectedClips: [clipId],
      };
    }

    case TIMELINE_ACTIONS.DESELECT_ALL: {
      return {
        ...state,
        selectedClips: [],
      };
    }

    case TIMELINE_ACTIONS.SET_PLAYHEAD: {
      return {
        ...state,
        playhead: action.payload,
      };
    }

    case TIMELINE_ACTIONS.SET_ZOOM: {
      return {
        ...state,
        zoom: action.payload,
      };
    }

    case TIMELINE_ACTIONS.SET_DURATION: {
      return {
        ...state,
        duration: action.payload,
      };
    }

    case TIMELINE_ACTIONS.SET_PLAYING: {
      return {
        ...state,
        playing: action.payload,
      };
    }

    case TIMELINE_ACTIONS.SET_SNAPPING: {
      return {
        ...state,
        snapping: action.payload,
      };
    }

    default:
      return state;
  }
};
