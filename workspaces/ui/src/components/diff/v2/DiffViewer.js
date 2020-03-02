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
import {SuggestionsContext} from './DiffPageNew';
import Card from '@material-ui/core/Card';
import {UpdatedBlue, UpdatedBlueBackground} from '../../../contexts/ColorContext';
import MuiAlert from '@material-ui/lab/Alert';
import {Show} from '../../shared/Show';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {},
  container: {
    maxWidth: 650
  },
  formControl: {
    margin: theme.spacing(0),
  },
  heading: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 500,
    padding: 0,
    marginLeft: 0,
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
      nameOverride
    } = this.props;


    const isEmpty = groupDiffs.length === 0

    return (
      <div className={classes.container}>
        <DocSubGroupBig className={classes.root} title={nameOverride} disabled={isEmpty}>
          {isEmpty}
          <List dense>
            {groupDiffs.map((diff, index) => {
              const selected = !!selectedDiff && CompareEquality.between(selectedDiff, diff);
              const interactions = getInteractionsForDiff(diff);
              const diffDescription = getDiffDescription(diff, interactions[0]);
              const interpretations = selected ? interpretationsForDiffAndInteraction(diff, currentExample) : [];
              return (
                <div style={{borderLeft: selected && `2px solid ${UpdatedBlue}`, backgroundColor: selected && UpdatedBlueBackground}}>
                  <ListItem button={!selected}
                            onClick={() => !selected ? setSelectedDiff(diff) : undefined}>
                    <ListItemText primary={<Typography className={classes.heading}>{diffDescription.title}</Typography>}>
                    </ListItemText>
                  </ListItem>
                  <Show when={Boolean(selected)}>
                    <div style={{marginLeft: 15}}>
                      <FormHelperText>Suggested changes:</FormHelperText>
                      <List dense>
                        {selected && interpretations.map((interpretation, index) => {
                          return (
                            <InterpretationRow
                              action={interpretation.title + interpretation.description}
                              active={selectedInterpretation && CompareEquality.betweenWithoutCommands(selectedInterpretation, interpretation)}
                              onClick={() => setSelectedInterpretation(interpretation, index)}/>
                          );
                        })}
                        <div style={{textAlign: 'right', marginTop: 15, paddingRight: 15}}>
                          <Button size="small" color="primary">Ignore Diff</Button>
                            <Button size="small" color="secondary" variant="contained"
                                    style={{marginLeft: 12}} disabled={!Boolean(selectedInterpretation)}
                                    onClick={() => acceptSuggestion(selectedInterpretation, diff)}>Confirm</Button>
                        </div>
                      </List>
                    </div>
                  </Show>
                </div>
              );

            })}
          </List>
          {/*<SuggestionsContext.Consumer>*/}
          {/*  {(suggestionsContext) => {*/}
          {/*    const {acceptedSuggestionsWithDiff} = suggestionsContext;*/}

          {/*    return (*/}
          {/*      <DocSubGroup title="Accepted Suggestions">*/}
          {/*        <List>*/}
          {/*          {acceptedSuggestionsWithDiff.map(i => (*/}
          {/*            <ListItem>*/}
          {/*              <ListItemText primary={i.suggestion.description}/>*/}
          {/*            </ListItem>*/}
          {/*          ))}*/}
          {/*        </List>*/}
          {/*      </DocSubGroup>);*/}
          {/*  }}*/}
          {/*</SuggestionsContext.Consumer>*/}
        </DocSubGroupBig>
      </div>
    );

  }
}

function InterpretationRow(props) {

  const {action, active, onClick, confirm} = props;

  return (
    <ListItem
      dense
      style={{padding: 0, paddingLeft: 0, marginLeft: 0}}
      button
      selected={active}
      onKeyDown={(e) => {
        if (e.which === 13) {
          if (active) {
            alert('finish');
          } else {
            onClick();
          }
        }
      }}
      onClick={!active && onClick}>
      <ListItemAvatar style={{minWidth: 25}}>
        <Radio
          size="small"
          tabIndex={-1}
          checked={active}
          style={{pointerEvents: 'none', fontSize: 11, marginLeft: -5}}
          color="primary"/>
      </ListItemAvatar>
      <ListItemText primary={action} primaryTypographyProps={{fontSize: 12}}/>
    </ListItem>
  );
}

export default withDiffContext(withStyles(styles)(DiffViewer));
