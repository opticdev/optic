import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import { useFeatureStyles } from './featureStyles';
import { buildDemoUrl } from '../pick-demo-env';

export const useStyles = makeStyles({
  container: {
    textAlign: 'center',
  },
  scaledIframe: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    margin: '0 auto',
    height: 790,
    '-ms-zoom': 0.75,
    '-moz-transform': 'scale(0.75)',
    '-moz-transform-origin': '0 0',
    '-o-transform': 'scale(0.75)',
    '-o-transform-origin': '0 0',
    '-webkit-transform': 'scale(0.75)',
    '-webkit-transform-origin': '0 0',
    '&:hover $hover': {
      visibility: 'hidden',
    },
  },
  hover: {
    position: 'absolute',
    fontSize: 30,
    backgroundColor: '#5a5a5a',
    color: 'white',
    padding: 12,
    fontWeight: 400,
    borderRadius: 10,
    transform: 'scale(1)',
    animation: `$pulse 3000ms infinite`,
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
    },
    '50%': {
      transform: 'scale(1.0)',
    },
    '100%': {
      transform: 'scale(.95)',
    },
  },
  innerIframe: {
    border: 'none',
    outline: 'none',
    padding: 0,
    overflow: 'none',
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
      cursor: 'pointer',
      transition: 'opacity .2s',
    },
  },
});

export function IFrameDemo2(props) {
  const { demoPath } = props;
  const featuredStyles = useFeatureStyles();
  const classes = useStyles();
  const size = useWindowSize();
  const forcedUpperBound = 1400;
  const iframeWidth = size.width * 1.25;

  const actualWidth =
    iframeWidth > forcedUpperBound ? forcedUpperBound : iframeWidth;

  const marginLeft = (size.width - actualWidth / 1.25) / 2;

  return (
    <Container maxWidth={false} className={classes.container}>
      <Paper
        className={classes.scaledIframe}
        elevation={7}
        style={{
          marginLeft,
          width: actualWidth,
        }}
      >
        <iframe
          width={'100%'}
          height={790}
          src={buildDemoUrl(demoPath)}
          className={classes.innerIframe}
        ></iframe>
        <Typography variant="subtitle2" className={classes.hover}>
          Hover to Start Interactive Demo
        </Typography>
      </Paper>
    </Container>
  );
}

export function IFrameDemoNotCentered(props) {
  const { demoPath } = props;
  const featuredStyles = useFeatureStyles();
  const classes = useStyles();
  const forcedUpperBound = 800;
  const iframeWidth = 800 * 1.25;

  console.log(iframeWidth);

  return (
    <Paper
      className={classes.scaledIframe}
      elevation={7}
      style={{
        marginLeft: 0,
        width: '125%',
        marginBottom: -150,
      }}
    >
      <iframe
        width={'100%'}
        height={790}
        src={buildDemoUrl(demoPath)}
        className={classes.innerIframe}
      ></iframe>
      <Typography variant="subtitle2" className={classes.hover}>
        Hover to Start Interactive Demo
      </Typography>
    </Paper>
  );
}

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}
