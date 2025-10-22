import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import {
  VolumeOff as MuteIcon,
  VolumeUp as UnmuteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Videocam as VideoIcon,
  AudioFile as AudioIcon,
} from '@mui/icons-material';
import { TIMELINE_COLORS } from '../../constants/timelineConstants';
import { useTimeline } from '../../contexts/TimelineContext';

const TrackHeader = ({ track }) => {
  const { updateTrack } = useTimeline();

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    updateTrack(track.id, { muted: !track.muted });
  };

  const handleLockToggle = (e) => {
    e.stopPropagation();
    updateTrack(track.id, { locked: !track.locked });
  };

  return (
    <Box
      sx={{
        width: 150,
        height: track.height,
        backgroundColor: '#1e1e1e',
        borderRight: `1px solid ${TIMELINE_COLORS.trackBorder}`,
        borderBottom: `1px solid ${TIMELINE_COLORS.trackBorder}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 1,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {track.type === 'video' ? (
          <VideoIcon sx={{ fontSize: 16, color: '#64C8FF' }} />
        ) : (
          <AudioIcon sx={{ fontSize: 16, color: '#64FFC8' }} />
        )}
        <Typography
          variant="caption"
          sx={{
            flex: 1,
            fontSize: 11,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {track.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={track.muted ? 'Unmute' : 'Mute'}>
          <IconButton
            size="small"
            onClick={handleMuteToggle}
            sx={{
              padding: 0.5,
              color: track.muted ? '#ff4444' : 'rgba(255,255,255,0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {track.muted ? <MuteIcon fontSize="small" /> : <UnmuteIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={track.locked ? 'Unlock' : 'Lock'}>
          <IconButton
            size="small"
            onClick={handleLockToggle}
            sx={{
              padding: 0.5,
              color: track.locked ? '#ffaa00' : 'rgba(255,255,255,0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {track.locked ? <LockIcon fontSize="small" /> : <UnlockIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TrackHeader;
