import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Slider, 
  Typography, 
  TextField, 
  InputAdornment,
  Button,
  ButtonGroup,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  RestartAlt, 
  FastForward, 
  FastRewind,
  Speed as SpeedIcon
} from '@mui/icons-material';

// Styles as object
const styles = {
  container: {
    padding: '16px',
    borderRadius: 8,
    background: 'linear-gradient(145deg, #262626, #1e1e1e)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  controlHeader: {
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  resetButton: {
    textTransform: 'none',
    borderRadius: 20,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginTop: 24,
  },
  slider: {
    '& .MuiSlider-markLabel': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiSlider-markLabelActive': {
      color: '#fff',
    },
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  presetsContainer: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  presetButton: {
    borderRadius: 20,
    padding: '4px 12px',
    textTransform: 'none',
    minWidth: 'auto',
  },
  originalFpsMarker: {
    position: 'absolute',
    height: 16,
    width: 4,
    backgroundColor: '#3f51b5',
    top: 12,
    transform: 'translateX(-50%)',
    zIndex: 1,
    borderRadius: 2,
  },
  inputField: {
    width: 120,
    '& .MuiInputBase-input': {
      textAlign: 'center',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      },
    },
  },
};

const FpsControl = ({ originalFps, onFpsChange }) => {
  const [fps, setFps] = useState(originalFps || 30);
  const [sliderMarks, setSliderMarks] = useState([]);
  const theme = useTheme();
  
  // Update fps when originalFps changes
  useEffect(() => {
    if (originalFps) {
      setFps(originalFps);
      generateMarks(originalFps);
    }
  }, [originalFps]);
  
  // Generate marks for the slider based on the original FPS
  const generateMarks = (baseFps) => {
    // Convert to number to ensure calculations work
    const numericFps = Number(baseFps);
    
    // Create dynamic slider marks
    const newMarks = [];
    
    // Basic slow motion presets (half and quarter speed)
    newMarks.push({ value: numericFps / 4, label: '25%' });
    newMarks.push({ value: numericFps / 2, label: '50%' });
    
    // Original FPS (100%)
    newMarks.push({ 
      value: numericFps, 
      label: '100%'
    });
    
    // Double and quadruple speed
    newMarks.push({ value: numericFps * 2, label: '200%' });
    
    if (numericFps * 4 <= 240) { // Only add if within reasonable range
      newMarks.push({ value: numericFps * 4, label: '400%' });
    }
    
    setSliderMarks(newMarks);
  };
  
  const handleSliderChange = (event, newValue) => {
    // Ensure newValue is a number
    const numericValue = Number(newValue);
    // Round to one decimal place
    const roundedValue = Math.round(numericValue * 10) / 10;
    setFps(roundedValue);
    onFpsChange(roundedValue);
  };
  
  const handleInputChange = (event) => {
    const input = event.target.value;
    
    // Allow empty input
    if (input === '') {
      setFps('');
      return;
    }
    
    // Parse as float and validate
    const numericValue = parseFloat(input);
    
    // Check if it's a valid number
    if (!isNaN(numericValue) && numericValue > 0) {
      // Round to one decimal place
      const roundedValue = Math.round(numericValue * 10) / 10;
      
      // Clamp value between 1 and 240
      const clampedValue = Math.min(Math.max(roundedValue, 1), 240);
      
      setFps(clampedValue);
      onFpsChange(clampedValue);
    }
  };
  
  const handleInputBlur = () => {
    // If field is empty, reset to original FPS
    if (fps === '') {
      setFps(originalFps);
      onFpsChange(originalFps);
    }
  };
  
  const handleReset = () => {
    setFps(originalFps);
    onFpsChange(originalFps);
  };
  
  const handleIncreaseFps = () => {
    const newFps = Math.min(240, parseFloat(fps) + 1);
    setFps(newFps);
    onFpsChange(newFps);
  };
  
  const handleDecreaseFps = () => {
    const newFps = Math.max(1, parseFloat(fps) - 1);
    setFps(newFps);
    onFpsChange(newFps);
  };
  
  const handlePresetClick = (presetFps) => {
    setFps(presetFps);
    onFpsChange(presetFps);
  };
  
  // Calculate the percentage of the slider where the original FPS marker should be positioned
  const getOriginalFpsPosition = () => {
    const min = 1;
    const max = 240;
    const percentage = ((originalFps - min) / (max - min)) * 100;
    return `${percentage}%`;
  };

  return (
    <Box style={styles.container}>
      <Box style={styles.controlHeader}>
        <Box style={styles.headerTitle}>
          <SpeedIcon color="primary" />
          <Typography variant="h6">FPS Control</Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReset} 
          size="small"
          style={styles.resetButton}
          startIcon={<RestartAlt />}
        >
          Reset to {originalFps} FPS
        </Button>
      </Box>
      
      <Box style={styles.sliderContainer}>
        <Box sx={{ position: 'relative' }}>
          <Box 
            style={{
              ...styles.originalFpsMarker,
              left: getOriginalFpsPosition(),
            }}
          />
          <Slider
            value={fps}
            onChange={handleSliderChange}
            min={1}
            max={240}
            step={0.1}
            marks={sliderMarks}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value} FPS`}
            style={styles.slider}
          />
        </Box>
      </Box>
      
      <Box style={styles.inputContainer}>
        <ButtonGroup variant="outlined">
          <Tooltip title="Decrease by 1 FPS">
            <Button onClick={handleDecreaseFps} aria-label="Decrease FPS by 1">
              <FastRewind />
            </Button>
          </Tooltip>
          <TextField
            value={fps}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            InputProps={{
              endAdornment: <InputAdornment position="end">FPS</InputAdornment>,
            }}
            variant="outlined"
            size="small"
            style={styles.inputField}
            inputProps={{
              style: { textAlign: 'right' },
              'aria-label': 'fps value'
            }}
          />
          <Tooltip title="Increase by 1 FPS">
            <Button onClick={handleIncreaseFps} aria-label="Increase FPS by 1">
              <FastForward />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
      
      <Box style={styles.presetsContainer}>
        <Typography variant="body2" sx={{ marginRight: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          Presets:
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          {[24, 30, 60, 120].map((presetFps) => (
            <Button
              key={presetFps}
              onClick={() => handlePresetClick(presetFps)}
              style={{
                ...styles.presetButton,
                backgroundColor: fps === presetFps ? theme.palette.primary.main : 'transparent',
                color: fps === presetFps ? 'white' : undefined,
              }}
            >
              {presetFps}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default FpsControl; 