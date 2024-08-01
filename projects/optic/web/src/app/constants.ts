import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const changeBgColors = {
  added: 'rgba(186, 235, 168, 0.4)',
  removed: '#ecd5d5',
  changed: '#f1edd8',
};

export const changeIndicatedColors = {
  added: 'rgba(70,168,34,0.3)',
  removed: '#e79898',
  changed: '#d3c78b',
};

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a1a1a',
    },
    secondary: {
      main: '#19857b',
    },
    text: {
      primary: '#3c4257',
    },
    error: {
      main: red.A400,
    },
  },
  components: {
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '1rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,.6)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 35,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: 15,
          fontWeight: 600,
          minHeight: 35,
          minWidth: 50,
          borderRadius: '10px',
          overflow: 'hidden',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgb(246,246,246)',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          fontWeight: 700,
          textTransform: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Inconsolata',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h3: {
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 5,
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
    },
    h5: {
      fontSize: 19,
      fontFamily: 'Inconsolata, monospace',
    },
    h6: {
      fontWeight: 600,
      color: '#383737',
      fontSize: 17,
    },

    body1: {
      fontSize: 14,
      color: '#4f566b',
    },
    body2: {
      color: '#4f566b',
      fontSize: 16,
    },
    caption: {
      color: '#8792a2',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: 13,
      color: '#3c4257',
    },
  },
});

export default theme;
