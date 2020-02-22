import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {DocDarkGrey, DocDivider} from '../../requests/DocConstants';
import {DocSubGroup} from '../../requests/DocSubGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import FormHelperText from '@material-ui/core/FormHelperText';
import {primary} from '../../../theme';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {ListItemAvatar, ListItemSecondaryAction} from '@material-ui/core';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import {withDiffContext} from './DiffContext';
import Slide from '@material-ui/core/Slide';
import Zoom from '@material-ui/core/Zoom';

const styles = theme => ({
  root: {},
  formControl: {
    margin: theme.spacing(0),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
});

const nameMapping = {
  'query': 'Query parameters diff',
  'requestBody': 'Request Body Diff'
};

class DiffViewer extends React.Component {

  render() {
    const {
      classes,
      diffsByGroup,
      selectedDiffId,
      setSelectedDiff,
      setSelectedInterpretation,
      selectedInterpretationIndex
    } = this.props;

    const renderGroup = (groupName) => {
      const groupDiffs = diffsByGroup(groupName);
      if (groupDiffs.length === 0) {
        return null;
      }
      return (
        <DocSubGroup className={classes.root} title={nameMapping[groupName]} innerStyle={{marginTop: 12}}>
          {groupDiffs.map((diff, index) => {
            const selected = diff.diffHash === selectedDiffId;
            return (
              <ExpansionPanel expanded={selected}
                              onChange={() => !selected ? setSelectedDiff(diff) : setSelectedDiff(null)}>
                <ExpansionPanelSummary
                  style={selected ? {backgroundColor: primary, color: 'white'} : {}}
                  expandIcon={<ExpandMoreIcon style={selected ? {color: 'white'} : {}}/>}
                >
                  <Typography className={classes.heading}>{diff.title}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{display: 'flex', flexDirection: 'column', marginTop: 6}}>
                  <FormHelperText style={{marginBottom: 8}}>Suggested changes to your specification:</FormHelperText>
                  <List dense style={{marginLeft: -15}}>
                    {diff.interpretations.map((interpretation, index) => {
                      return (
                        <InterpretationRow
                          action={interpretation.action}
                          active={selectedInterpretationIndex === index}
                          onClick={() => setSelectedInterpretation(interpretation, index)}/>
                      );
                    })}
                  </List>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );

          })}
        </DocSubGroup>
      );
    };

    return (
      <div>
        {renderGroup('query')}
        {renderGroup('requestBody')}
      </div>
    );
  }
}

function InterpretationRow(props) {

  const {action, active, onClick} = props;

  return (
    <ListItem
      dense
      style={{paddingLeft: 10, marginLeft: 0}}
      button
      selected={active}
      onKeyDown={(e) => {
        if (e.which === 13) {
          if (active) {
            alert('finish')
          } else {
            onClick()
          }
        }
      }}
      onClick={onClick}>
      <ListItemAvatar style={{minWidth: 25}}><Radio tabIndex={-1} checked={active} style={{pointerEvents: 'none'}}
                                                    color="primary"/></ListItemAvatar>
      <ListItemText primary={action}/>
      <ListItemSecondaryAction>
        <Zoom direction="up" in={active}  mountOnEnter unmountOnExit>
          <Button size="small" autoFocus variant="contained" color="secondary">Confirm</Button>
        </Zoom>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default withDiffContext(withStyles(styles)(DiffViewer));
