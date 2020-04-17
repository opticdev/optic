import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {Card, TextField} from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 10,
    paddingBottom: 5,
    marginBottom: 50
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  disabled: {
    pointerEvents: 'none',
    opacity: .4
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  content: {
    display: 'flex',
    flexDirection: 'row'
  }
}));


export const CommitCard = ({acceptedSuggestions, ignoredDiffs, interactionsWithDiffsCount, diffCount, method, fullPath, endpointPurpose, reset, apply}) => {
  const classes = useStyles();
  const [commitMessage, setCommitMessage] = useState('');
  const pluralIf = (collection) => collection.length !== 1 ? 's' : '';
  const pluralIfI = (i) => i !== 1 ? 's' : '';

  const [finalize, setFinalize] = useState(false);

  const finalizeWithOverride = finalize || diffCount === 0;

  useEffect(() => {
    if (finalizeWithOverride) {
      const pastTenseChanges = acceptedSuggestions.map(i => `- ${i.pastTenseAction}`).join("\n")
      setCommitMessage(`\n\nChanges:\n${pastTenseChanges}`)
    }
  }, [finalizeWithOverride])

  if (acceptedSuggestions.length === 0 && ignoredDiffs.length === 0) {
    return null
  }

  return (
    <Card className={classNames(classes.root)} elevation={2}>
      <CardContent>

        <div className={classes.content}>
          <div style={{flex: 1}}>
            <Typography variant="h5" gutterBottom color="primary">Review Endpoint Diff</Typography>
            <Typography variant="subtitle1" component="h2" color="textSecondary">
              You have accepted {acceptedSuggestions.length} suggestion{pluralIf(acceptedSuggestions)}, and
              ignored {ignoredDiffs.length} diff{pluralIf(ignoredDiffs)}
            </Typography>

            {finalizeWithOverride && (<TextField multiline
                                                 style={{marginTop: 15}}
                                                 value={commitMessage}
                                                 fullWidth
                                                 onFocus={(e) => e.currentTarget.setSelectionRange(0, 0)}
                                                 placeholder="Describe the changes you made to the API Contract"
                                                 onChange={(e) => setCommitMessage(e.target.value)}/>)}


            <div style={{marginTop: 15}}>
              <Button size="small" onClick={() => {
                reset();
                setFinalize(false);
              }} variant="outlined">Reset</Button>
              {!finalizeWithOverride &&
              <Button size="small" onClick={() => setFinalize(true)} style={{marginLeft: 11}} variant="contained"
                      color="primary">Finalize</Button>}
              {finalizeWithOverride &&
              <Button size="small" onClick={() => apply(commitMessage)} style={{marginLeft: 11}} variant="contained"
                      color="primary">Commit Changes</Button>}
            </div>
            {/*<CardActions style={{textAlign: 'right'}}>*/}
            {/*  <Button onClick={reset}>Reset</Button>*/}
            {/*  <Button onClick={() => apply(commitMessage)} color="secondary">Commit Changes</Button>*/}
            {/*</CardActions>*/}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
