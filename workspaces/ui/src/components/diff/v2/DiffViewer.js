import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {DocSubGroup} from '../../requests/DocSubGroup';
import Radio from '@material-ui/core/Radio';
import FormHelperText from '@material-ui/core/FormHelperText';
import {primary} from '../../../theme';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {ListItemAvatar, ListItemSecondaryAction} from '@material-ui/core';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import {CompareEquality} from '@useoptic/domain';
import {withDiffContext} from './DiffContext';
import Zoom from '@material-ui/core/Zoom';

const styles = theme => ({
  root: {},
  container: {
    maxWidth: 650
  },
  formControl: {
    margin: theme.spacing(0),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexShrink: 0,
    fontWeight: 200,
    textOverflow: 'none',
  },
  noOverflow: {
    overflow: 'hidden',
    wordBreak: 'break-all'
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
      regionName,
      getDiffsByRegion,
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

    const groupDiffs = getDiffsByRegion(regionName);
    if (groupDiffs.length === 0) {
      return null;
    }

    return (
      <div className={classes.container}>
        <DocSubGroup className={classes.root} title={nameOverride} innerStyle={{marginTop: 12}}>
          {groupDiffs.map((diff, index) => {
            const selected = !!selectedDiff && CompareEquality.between(selectedDiff, diff);
            const interactions = getInteractionsForDiff(diff);
            const diffDescription = getDiffDescription(diff, interactions[0]);
            const interpretations = selected ? interpretationsForDiffAndInteraction(diff, currentExample) : [];

            return (
              <ExpansionPanel expanded={selected}
                              onChange={() => !selected ? setSelectedDiff(diff) : setSelectedDiff(null)}>
                <ExpansionPanelSummary
                  className={classes.noOverflow}
                  style={selected ? {backgroundColor: primary, color: 'white'} : {}}
                  expandIcon={<ExpandMoreIcon style={selected ? {color: 'white'} : {}}/>}
                >
                  <Typography className={classes.heading}>{diffDescription.title}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{display: 'flex', flexDirection: 'column', marginTop: 6}}>
                  <FormHelperText style={{marginBottom: 8}}>Suggested changes to your specification:</FormHelperText>
                  <List dense style={{marginLeft: -15}}>
                    {selected && interpretations.map((interpretation, index) => {
                      return (
                        <InterpretationRow
                          action={interpretation.title + interpretation.description}
                          active={selectedInterpretation && CompareEquality.betweenWithoutCommands(selectedInterpretation, interpretation)}
                          confirm={acceptSuggestion}
                          onClick={() => setSelectedInterpretation(interpretation, index)}/>
                      );
                    })}
                  </List>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );

          })}
        </DocSubGroup>
      </div>
    );

  }
}

function InterpretationRow(props) {

  const {action, active, onClick, confirm} = props;

  return (
    <ListItem
      dense
      style={{paddingLeft: 10, marginLeft: 0}}
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
          tabIndex={-1}
          checked={active}
          style={{pointerEvents: 'none'}}
          color="primary"/>
      </ListItemAvatar>
      <ListItemText primary={action}/>
      <ListItemSecondaryAction>
        <Zoom direction="up" in={active} mountOnEnter unmountOnExit>
          <Button size="small"
                  autoFocus
                  variant="contained"
                  color="secondary"
                  onClick={confirm}>Confirm</Button>
        </Zoom>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default withDiffContext(withStyles(styles)(DiffViewer));
