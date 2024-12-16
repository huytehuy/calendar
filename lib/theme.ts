'use client'

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#4285f4',
      dark: '#1557b0'
    },
    secondary: {
      main: '#ea4335',
      light: '#ff6659',
      dark: '#b31412'
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368'
    },
    grey: {
      50: '#f8f9fa',
      100: '#f1f3f4',
      200: '#e8eaed'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          '&:active': {
            transform: 'translateY(1px)'
          },
          '&:focus': {
            outline: 'none',
            boxShadow: 'none'
          }
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
          }
        },
        outlined: {
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,0,0,0.04)',
          '&:hover': {
            borderColor: 'transparent',
            backgroundColor: 'rgba(0,0,0,0.08)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: 'none'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(0,0,0,0.04)'
          },
          '&:active': {
            transform: 'scale(0.95)'
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0,0,0,0.1)',
              boxShadow: '0 0 0 2px rgba(26,115,232,0.1)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0,0,0,0.2)'
            }
          }
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1500
        }
      }
    }
  },
  shape: {
    borderRadius: 8
  }
})

export default theme 