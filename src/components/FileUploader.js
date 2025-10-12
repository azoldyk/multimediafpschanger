import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Paper, 
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  CloudUpload as UploadIcon,
  VideoFile as VideoIcon,
  AddToQueue as AddIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

// Styles as object
const styles = {
  container: {
    padding: 24,
    borderRadius: 8,
    background: 'linear-gradient(145deg, #1e1e1e, #262626)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
  dragActive: {
    borderColor: '#3f51b5',
    backgroundColor: 'rgba(63, 81, 181, 0.08)',
  },
  uploadArea: {
    border: '2px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: '32px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
  },
  input: {
    display: 'none',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  uploadButton: {
    marginTop: 16,
    textTransform: 'none',
    fontWeight: 'bold',
    borderRadius: 28,
    padding: '8px 24px',
  },
  listContainer: {
    marginTop: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    maxHeight: 300,
    overflow: 'auto',
  },
  listItem: {
    borderLeft: '4px solid transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderLeftColor: '#3f51b5',
    },
  },
  listItemSelected: {
    borderLeftColor: '#f50057',
    backgroundColor: 'rgba(245, 0, 87, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(245, 0, 87, 0.12)',
    },
  },
  fileIcon: {
    marginRight: 12,
    color: '#f50057',
  },
  dragIcon: {
    color: 'rgba(255, 255, 255, 0.3)',
    marginRight: 8,
  },
  emptyListMessage: {
    padding: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  divider: {
    margin: '24px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  fileSize: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
  },
  title: {
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleIcon: {
    color: '#3f51b5',
  }
};

const FileUploader = ({ onFileSelect, selectedFile }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log("File dropped:", file.name);
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // Only process video files
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file.');
      return;
    }
    
    console.log("Processing video file:", file.name);
    
    // Check if file is already in the list
    if (!files.some(f => f.name === file.name)) {
      setFiles(prevFiles => [...prevFiles, file]);
    }
    
    // Select the file for preview - call the parent callback
    onFileSelect(file);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("File selected via input:", file.name);
      handleFile(file);
    }
  };

  const handleFileSelect = (file) => {
    console.log("FileUploader: Selected file from list:", file.name);
    
    // Make sure the file is actually loaded 
    if (file instanceof File && file.size > 0) {
      onFileSelect(file);
    } else {
      console.warn("FileUploader: Invalid file selection:", file);
    }
  };

  const handleFileDelete = (fileToDelete) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToDelete));
    
    // If the deleted file is the selected one, clear the selection
    if (selectedFile === fileToDelete) {
      onFileSelect(null);
    }
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Paper elevation={5} style={styles.container}>
      <Box style={styles.title}>
        <AddIcon style={styles.titleIcon} />
        <Typography variant="h6" component="div">
          Upload Video
        </Typography>
      </Box>
      
      <Box 
        style={{
          ...styles.uploadArea,
          ...(dragActive ? styles.dragActive : {})
        }}
        onClick={handleFileClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={styles.input}
          accept="video/*"
        />
        <UploadIcon style={styles.icon} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Video File Here
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Or click to browse your computer
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<VideoIcon />}
          style={styles.uploadButton}
        >
          Select Video File
        </Button>
      </Box>

      <Divider style={styles.divider} />
      
      <Typography variant="subtitle1" gutterBottom>
        Uploaded Videos ({files.length})
      </Typography>
      
      <Box>
        <List sx={{ 
          maxHeight: 300, 
          overflow: 'auto',
          borderRadius: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          marginTop: 2
        }}>
          {files.length > 0 ? (
            files.map((file, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleFileSelect(file)}
                sx={{
                  borderLeft: '4px solid',
                  borderLeftColor: selectedFile === file 
                    ? '#f50057' 
                    : 'transparent',
                  backgroundColor: selectedFile === file 
                    ? 'rgba(245, 0, 87, 0.08)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedFile === file 
                      ? 'rgba(245, 0, 87, 0.12)'
                      : 'rgba(0, 0, 0, 0.2)',
                    borderLeftColor: '#3f51b5',
                  },
                }}
              >
                <DragIcon sx={{ marginRight: 1, color: 'rgba(255, 255, 255, 0.3)' }} />
                <VideoIcon sx={{ marginRight: 1, color: '#f50057' }} />
                <ListItemText 
                  primary={file.name} 
                  secondary={`${formatFileSize(file.size)} - ${file.type.split('/')[1]}`} 
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDelete(file);
                    }}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary="No video files added yet" 
                sx={{ textAlign: 'center', opacity: 0.5 }} 
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default FileUploader; 