import React from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { primary, UpdatedBlueBackground } from '../../theme';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { DocDarkGrey } from '../docs/DocConstants';

export function RenderTask(props) {
  const classes = useStyles();
  return (
    <Paper elevation={1} className={classes.root}>
      <Box display="flex" alignItems="center">
        <PlayArrowIcon style={{ color: primary, width: 15, height: 15 }} />
        <Code>
          api {props.name === 'start' ? '' : 'run'} {props.name}
        </Code>
      </Box>
      <Box
        display="flex"
        alignItems="flex-end"
        justifyContent="space-between"
        style={{ paddingLeft: 20, paddingRight: 0 }}
      >
        <Typography variant="caption" className={classes.detail}>
          {props.command}
        </Typography>
        <Typography variant="caption" className={classes.detail}>
          <Code style={{ marginRight: 0 }}>{props.inboundUrl}</Code>
        </Typography>
      </Box>
    </Paper>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 6,
    paddingRight: 0,
    marginBottom: 9,
    display: 'flex',
    flexDirection: 'column',
  },
  detail: {
    fontFamily: 'Ubuntu Mono',
    color: DocDarkGrey,
  },
}));

const Code = (props) => {
  const classes = codeStyles();
  return (
    <Typography
      component="span"
      variant={props.variant}
      className={classes.codeInline}
      style={props.style}
    >
      {props.children}
    </Typography>
  );
};

const codeStyles = makeStyles((theme) => ({
  codeInline: {
    padding: 3,
    paddingLeft: 4,
    marginLeft: 3,
    marginRight: 3,
    paddingRight: 4,
    fontWeight: 700,
    backgroundColor: UpdatedBlueBackground,
    fontFamily: 'Ubuntu Mono',
  },
}));
