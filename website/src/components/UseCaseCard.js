import React from 'react';
import { useHistory } from '@docusaurus/router';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { SubtleBlueBackground, UpdatedBlue } from './theme';
import { Paper, Typography } from '@material-ui/core';
import { FormatCopy } from './FormatCopy';
import { useFeatureStyles } from './featureStyles';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 15,
    backgroundColor: SubtleBlueBackground,
    border: '1px solid',
    borderColor: 'transparent',
    cursor: 'pointer',
    marginBottom: 12,
    pointerEvents: 1,
    '&:hover': {
      transition: 'all .2s ease-in-out',
      transform: 'scale(1.01)',
      borderColor: UpdatedBlue,
    },
  },

  root: {},
}));

export const UseCaseCard = ({ title, link, description, logo }) => {
  const classes = useStyles();
  const featuredStyles = useFeatureStyles();
  const history = useHistory();
  return (
    <Paper
      elevation={2}
      className={classes.paper}
      onClick={() => {
        if (link) {
          if (link.startsWith('http://') || link.startsWith('https://')) {
            window.location = link;
          } else {
            history.push(link);
          }
        }
      }}
    >
      <Typography variant="h5">
        {logo} <FormatCopy value={title} />
      </Typography>

      <Typography variant="subtitle2" className={featuredStyles.descriptions}>
        {description}
      </Typography>
    </Paper>
  );
};
