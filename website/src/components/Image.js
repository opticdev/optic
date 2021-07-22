import React from 'react';
import { Paper } from '@material-ui/core';

export function DocsImage(props) {
  const { src, height, width } = props;

  return (
    <Paper
      style={{
        margin: 20,
        marginLeft: 0,
        display: 'flex',
        height,
        width,
      }}
      elevation={2}
    >
      <img src={src} />
    </Paper>
  );
}
