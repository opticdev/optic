import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {DocSubGroup, DocSubGroupBig} from '../../requests/DocSubGroup';
import Radio from '@material-ui/core/Radio';
import FormHelperText from '@material-ui/core/FormHelperText';
import {primary} from '../../../theme';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {CardHeader, Collapse, ListItemAvatar, ListItemIcon, ListItemSecondaryAction} from '@material-ui/core';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import {CompareEquality} from '@useoptic/domain';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import {withDiffContext} from './DiffContext';
import Zoom from '@material-ui/core/Zoom';
import {SuggestionsContext, IgnoreDiffContext} from './DiffPageNew';
import Card from '@material-ui/core/Card';
import {
  AddedGreenBackground,
  ChangedYellowBackground, RemovedRedBackground,
  UpdatedBlue,
  UpdatedBlueBackground
} from '../../../contexts/ColorContext';
import MuiAlert from '@material-ui/lab/Alert';
import {Show} from '../../shared/Show';
import Paper from '@material-ui/core/Paper';
import {DocGrid} from '../../requests/DocGrid';

const styles = theme => ({
  container: {
    maxWidth: 650,
  },
  formControl: {
    margin: theme.spacing(0),
  },
  heading: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: 500,
    padding: 0,
    marginLeft: -5,
    wordBreak: 'break-word',
    textOverflow: 'none',
  },
  noOverflow: {
    overflow: 'hidden',
    paddingLeft: 13
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
});

class DiffViewer extends React.Component {

  render() {
    const {
      classes,
      groupDiffs = [],
      getDiffDescription,
      getInteractionsForDiff,
      setSelectedDiff,
      interpretationsForDiffAndInteraction,
      currentExample,
      selectedDiff,
      setSelectedInterpretation,
      selectedInterpretation,
      acceptSuggestion,
      nameOverride,
      approvedKey
    } = this.props;

    const isEmpty = groupDiffs.length === 0;

    return (
      <div className={classes.container}>
        <DocSubGroupBig className={classes.root} title={nameOverride} disabled={isEmpty}>
          <List dense>
            {groupDiffs.map((diff, index) => {
              const selected = !!selectedDiff && CompareEquality.between(selectedDiff, diff);
              const interactions = getInteractionsForDiff(diff);
              const diffDescription = getDiffDescription(diff, interactions[0]);
              const interpretations = selected ? interpretationsForDiffAndInteraction(diff, currentExample) : [];
              return (
                <div style={{
                  borderLeft: selected && `2px solid ${UpdatedBlue}`,
                  backgroundColor: selected && UpdatedBlueBackground
                }}>
                  <ListItem button={!selected}
                            disableRipple
                            component={Card}
                            style={{display: 'flex', flexDirection: 'column', marginBottom: 8, alignItems: 'baseline'}}
                            onClick={() => !selected ? setSelectedDiff(diff) : undefined}>
                    <ListItemText
                      primary={<Typography className={classes.heading}>{diffDescription.title}</Typography>}>
                    </ListItemText>
                    <div style={{width: '100%'}}>
                    <Show when={Boolean(selected)}>
                      <>
                        <FormHelperText>Suggested changes:</FormHelperText>
                        <List dense>
                          {selected && interpretations.map((interpretation, index) => {
                            return (
                              <InterpretationRow
                                action={interpretation.title}
                                description={interpretation.description}
                                active={selectedInterpretation && CompareEquality.betweenWithoutCommands(selectedInterpretation, interpretation)}
                                onClick={() => setSelectedInterpretation(interpretation, index)}/>
                            );
                          })}
                          <div style={{textAlign: 'right', marginTop: 15, paddingRight: 15}}>
                            <IgnoreDiffContext.Consumer>
                              {({ignoreDiff}) => <Button size="small" color="primary" disableRipple onClick={() => ignoreDiff(diff)}>Ignore Diff</Button>}
                            </IgnoreDiffContext.Consumer>
                            <Button size="small" color="secondary" variant="contained"
                                    disableRipple
                                    style={{marginLeft: 12}} disabled={!Boolean(selectedInterpretation)}
                                    onClick={() => {
                                      acceptSuggestion(selectedInterpretation, diff, approvedKey);
                                    }}>Confirm</Button>
                          </div>
                        </List>
                      </>
                    </Show>
                    </div>
                  </ListItem>
                </div>
              );

            })}
          </List>

          <SuggestionsContext.Consumer>
            {({acceptedSuggestionsWithDiff}) => {
              const filtered = acceptedSuggestionsWithDiff.filter(i => i.key === approvedKey);
              if (filtered.length > 0) {

                function colorForChangeType(name) {
                  switch (name) {
                    case 'Addition':
                      return AddedGreenBackground
                    case 'Removal':
                      return RemovedRedBackground
                    case 'Update':
                      return ChangedYellowBackground
                  }
                }
                return (
                    <List style={{marginTop: -10}}>
                      {filtered.map(i => (
                        <ListItem style={{backgroundColor: colorForChangeType(i.suggestion.changeTypeAsString), marginTop: 4}}>
                          <Typography variant="caption"
                                      style={{paddingLeft: 0, marginLeft: -12}}>{i.suggestion.title}</Typography>
                        </ListItem>
                      ))}
                    </List>
                );
              }

            }}
          </SuggestionsContext.Consumer>
        </DocSubGroupBig>
      </div>
    );

  }
}

export function InterpretationRow(props) {
  const {action, description, active, onClick, confirm} = props;

  return (
    <ListItem
      dense
      style={{padding: 0, paddingLeft: 0, marginLeft: 0}}
      button
      selected={active}
      disableRipple
      onKeyDown={(e) => {
        if (e.which === 13) {
          if (active) {
            alert('finish');
            confirm()
          } else {
            onClick();
          }
        }
      }}
      onClick={!active ? onClick : confirm}>
      <ListItemAvatar style={{minWidth: 25}}>
        <Radio
          size="small"
          tabIndex={-1}
          checked={active}
          style={{pointerEvents: 'none', fontSize: 11, marginLeft: -5}}
          color="primary"/>
      </ListItemAvatar>
      <ListItemText primary={action} secondary={description} primaryTypographyProps={{fontSize: 12}}/>
    </ListItem>
  );
}

export default withDiffContext(withStyles(styles)(DiffViewer));
