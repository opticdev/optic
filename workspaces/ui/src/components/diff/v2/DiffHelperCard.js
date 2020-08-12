import React, { useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { DocDivider } from '../../docs/DocConstants';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import { DiffContext } from './DiffContext';
import { CompareEquality, mapScala } from '@useoptic/domain';
import { IgnoreDiffContext } from './DiffPageNew';
import { useDiffDescription, useSuggestionsForDiff } from './DiffHooks';
import { diff } from 'react-ace';
import { DiffCopy } from './DiffCopy';
import { track } from '../../../Analytics';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'sticky',
    top: 120,
  },
  header: {
    display: 'flex',
    alignItem: 'center',
    justifyContent: 'center',
    paddingLeft: 11,
    paddingTop: 14,
    paddingBottom: 9,
  },
  font: {
    fontSize: 13,
    fontWeight: 800,
    fontFamily: "'Source Code Pro', monospace",
  },
  icon: {
    paddingRight: 0,
  },
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(1) + 7,
    marginBottom: 7,
  },
  suggestion: {
    fontWeight: 400,
    marginLeft: -5,
    fontSize: 12,
  },
  buttons: {
    textAlign: 'right',
    padding: 8,
  },
}));

export const DiffHelperCard = (props) => {
  const classes = useStyles();
  const {
    inRequest,
    inResponse,
    description,
    currentInteraction,
    selectedInterpretation,
    setSelectedInterpretation,
    setSelectedDiff,
    selectedDiff,
  } = props;
  const { acceptSuggestion, clearPreview } = useContext(DiffContext);

  const suggestions = useSuggestionsForDiff(selectedDiff, currentInteraction);

  const showIt =
    (selectedDiff && selectedDiff.inRequest && inRequest) ||
    (selectedDiff.inResponse && inResponse);

  if (!showIt) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Card elevation={3}>
        <div className={classes.header}>
          <DiffCopy copy={description.summary} />
          <div style={{ flex: 1, minWidth: 20 }} />
          <PulsingOptic />
        </div>

        <DocDivider />

        <FormControl component="fieldset" className={classes.formControl}>
          <RadioGroup>
            {suggestions.map((suggestion, n) => {
              return (
                <FormControlLabel
                  key={n}
                  onClick={() => {
                    track("Demo - Previewing Suggestion", {suggestion: suggestion.action})
                    setSelectedInterpretation(suggestion)
                  }}
                  control={
                    <Radio
                      size="small"
                      color="primary"
                      value={suggestion}
                      checked={Boolean(
                        selectedInterpretation &&
                          CompareEquality.betweenWithoutCommands(
                            suggestion,
                            selectedInterpretation
                          )
                      )}
                    />
                  }
                  label={<DiffCopy copy={suggestion.copyPair.action} />}
                />
              );
            })}
          </RadioGroup>
        </FormControl>

        <DocDivider />

        <div className={classes.buttons}>
          <IgnoreDiffContext.Consumer>
            {({ ignoreDiff }) => {
              return (
                <Button
                  size="small"
                  onClick={() => {
                    const toIgnore = selectedDiff.diff;
                    setSelectedDiff(null);
                    ignoreDiff(toIgnore);
                  }}
                >
                  Ignore
                </Button>
              );
            }}
          </IgnoreDiffContext.Consumer>
          <Button
            color="primary"
            size="small"
            disabled={!selectedInterpretation}
            onClick={() => {
              setSelectedDiff(null);
              acceptSuggestion(selectedInterpretation);
            }}
          >
            Approve
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const PulsingOptic = () => (
  <div className={'blob'} style={{ marginRight: 9 }}>
    <img src="/optic-logo.svg" width={32} height={32} />
  </div>
);
