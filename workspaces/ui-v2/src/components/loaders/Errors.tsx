import React from 'react';
import { CenteredColumn } from '../layouts/CenteredColumn';
import { makeStyles } from '@material-ui/styles';
import { Box, Typography } from '@material-ui/core';
import { ErrorOutline as ErrorOutlineIcon } from '@material-ui/icons';

export function FullPageError({ errorMessage }: { errorMessage?: string }) {
  const classes = useStyles();
  return (
    <CenteredColumn maxWidth="md">
      <div className={classes.center}>
        <Box display="flex">
          <ErrorOutlineIcon fontSize="large" />
          <Typography
            variant="h6"
            color="textSecondary"
            className={classes.text}
          >
            {errorMessage || 'There was an error loading the page'}
          </Typography>
        </Box>
      </div>
    </CenteredColumn>
  );
}

const useStyles = makeStyles((theme) => ({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 40px)',
  },
  text: {
    marginLeft: 10,
    marginTop: -1,
    fontFamily: 'Ubuntu Mono',
  },
}));
