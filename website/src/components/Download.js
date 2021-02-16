import { useFeatureStyles } from './featureStyles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormatCopy } from './FormatCopy';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import { useStyles } from './CommandDemo';
import {Quote} from './Credo';
import {Divider} from '@material-ui/core';


export function Download() {
  const featuredStyles = useFeatureStyles();
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.gitBotContainer}>
     <Grid container>
       <Grid item>
         ABC
       </Grid>
       <Grid item>
         DEF
       </Grid>
     </Grid>

    </Container>
  );
}
