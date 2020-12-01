import React from 'react';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

export function RequestCounter(props) {
  const { value, target } = props;
  console.log({ value, target });
  return (
    <div
      style={{
        display: 'flex',
        maxWidth: 400,
        marginBottom: 7,
        alignItems: 'center',
      }}
    >
      <LinearProgress
        style={{ flex: 1 }}
        variant="determinate"
        value={value > target ? 100 : (value / target) * 100}
      />
    </div>
  );
}
