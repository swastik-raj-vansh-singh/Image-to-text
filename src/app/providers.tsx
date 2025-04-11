'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const breakpoints = {
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
};

const theme = extendTheme({
  breakpoints,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        minHeight: '100vh',
        overflowX: 'hidden'
      },
      'html, body': {
        maxWidth: '100vw'
      }
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
      sizes: {
        xs: {
          fontSize: '0.65rem',
          height: '1.5rem',
          minWidth: '1.5rem',
          padding: '0 0.5rem',
        }
      }
    },
    Container: {
      baseStyle: {
        maxW: {
          base: '100%',
          sm: '100%',
          md: '95%',
          lg: '90%',
          xl: '1400px',
        },
        px: {
          base: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
        }
      }
    },
    Text: {
      sizes: {
        '2xs': {
          fontSize: '0.625rem',
        }
      }
    }
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
} 