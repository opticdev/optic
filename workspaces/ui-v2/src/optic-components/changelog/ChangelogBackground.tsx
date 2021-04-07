import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { AddedGreen, AddedGreenBackground } from '../theme';

export const useChangelogStyles = makeStyles((theme) => ({
  added: {
    backgroundColor: `rgba(0,196,70,0.2)`,
    borderLeft: `2px solid ${AddedGreen}`,
  },
}));
