import React, { useState } from 'react';
import { 
  AppBar, 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  Toolbar, 
  Typography, 
  createTheme, 
  Box,
  Paper, 
  Grid,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FileUploader from './components/FileUploader';
import MediaPreviewer from './components/MediaPreviewer';
import AutoAwesome from '@mui/icons-material/AutoAwesome';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    action: {
      active: '#fff',
      hover: 'rgba(255, 255, 255, 0.08)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    body1: {
      lineHeight: 1.6,
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          backgroundImage: 'linear-gradient(to right, #3f51b5, #2196f3)',
        }
      }
    }
  }
});

// App styles
const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#121212',
  },
  title: {
    flexGrow: 1,
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  mainContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
    padding: 32,
    borderRadius: 8,
    background: 'linear-gradient(145deg, #1a1a1a, #222)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  headerTitle: {
    marginBottom: 16,
    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  },
  headerContent: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
  },
  infoBox: {
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    padding: 24,
    borderRadius: 8,
    marginTop: 24,
    border: '1px solid rgba(63, 81, 181, 0.2)',
    textAlign: 'center',
  },
  featureList: {
    paddingLeft: 0,
    margin: '16px 0',
    listStyle: 'none',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  featureItem: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  featureTitle: {
    color: '#3f51b5',
    marginBottom: '8px',
    fontWeight: 'bold',
  }
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleFileSelect = (file) => {
    if (file) {
      console.log(`App: Selected file "${file.name}" (${file.type}, ${formatFileSize(file.size)})`);
    } else {
      console.log("App: File selection cleared");
    }
    setSelectedFile(file);
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={styles.app}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" style={styles.title}>
              Custom FPS Video Player
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" style={styles.mainContainer}>
          <Paper elevation={4} style={styles.header}>
            <Typography variant="h4" component="h1" style={styles.headerTitle}>
              Custom FPS Video Player
            </Typography>
            <Box style={styles.headerContent}>
              <Typography variant="body1" paragraph>
                Set your own default FPS and adjust video playback speed by changing the frame rate.
              </Typography>
            </Box>
            
            <Box style={styles.infoBox}>
              <List sx={{ padding: 0 }}>
                <ListItem>
                  <ListItemIcon>
                    <AutoAwesome style={{ color: darkTheme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Custom Default FPS" 
                    secondary="Set your own default framerate for video playback" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AutoAwesome style={{ color: darkTheme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Accurate Playback Control" 
                    secondary="Adjust FPS with precision controls and custom presets" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AutoAwesome style={{ color: darkTheme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Audio Synchronization" 
                    secondary="Maintains perfect audio sync regardless of playback speed" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AutoAwesome style={{ color: darkTheme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Easy Workflow" 
                    secondary="Drag & drop video files to instantly adjust" 
                  />
                </ListItem>
              </List>
            </Box>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <MediaPreviewer file={selectedFile} />
          </Box>
          
          <Box>
            <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
