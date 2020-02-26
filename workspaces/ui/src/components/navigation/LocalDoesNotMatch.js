import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandLess';
import {primary} from '../../theme';
import {ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import {AddedGreen, RemovedRed} from '../../contexts/ColorContext';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import Card from '@material-ui/core/Card';
import {Show} from '../shared/Show';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import {Link} from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import {LightTooltip} from '../tooltips/LightTooltip';
import {DisplayPath, DisplayPathOnDark} from '../paths/DisplayPath';
import {PathIdToPathString} from '../paths/PathIdToPathString';
import {PURPOSE} from '../../ContributionKeys';
import ListSubheader from '@material-ui/core/ListSubheader';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    bottom: 25,
    right: 100,
    width: 300,
    transition: 'width 0.2s ease',
  },
  bg: {
    backgroundColor: primary,
    color: 'white',
    padding: 2
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function LocalDoesNotMatch(props) {

  const {sessionId, requestIdsWithDiffs, unrecognizedUrlCount, isIntegrationMode, cachedQueryResults, baseUrl, isLoading} = props;

  const noDiff = requestIdsWithDiffs.length === 0 && unrecognizedUrlCount === 0;

  const classes = useStyles();

  const [expanded, setExpanded] = useState(false);

  const summaryIcon = noDiff ? (<CheckIcon
      style={{color: AddedGreen, fontSize: 20, marginRight: 10, marginLeft: -9}}/>) :
    (
      <ReportProblemIcon
        style={{color: RemovedRed, fontSize: 20, marginRight: 10, marginLeft: -9}}/>
    );


  const summary = noDiff ? (<Typography className={classes.heading}>
    API Follows Contract
  </Typography>) : (
    <Typography className={classes.heading}>
      Undocumented Behavior
    </Typography>
  );

  return (
    <div className={classes.root} onMouseLeave={() => setExpanded(false)} style={{width: expanded ? 400 : 300}}>
      <ExpansionPanel expanded={expanded && !noDiff} elevation={2} className={classes.bg}>
        <ExpansionPanelSummary
          onClick={() => !noDiff && setExpanded(!expanded)}
          expandIcon={noDiff ? null : <ExpandMoreIcon style={{color: 'white'}}/>}
        >
          {summaryIcon} {summary}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.bg}>

          <div style={{color: 'black', backgroundColor: 'white', width: '100%', marginTop: -10}}>

            <List dense>
              <Show when={unrecognizedUrlCount > 0}>
                <ListItem dense button component={Link} to={`${baseUrl}/diff/${sessionId}/urls`}>
                  <ListItemText primary={`${unrecognizedUrlCount} Undocumented URLs Observed`}/>
                  <ListItemSecondaryAction>
                      <IconButton edge="end" size="small" disabled>
                        <PlusOneIcon/>
                      </IconButton>
                  </ListItemSecondaryAction>

                </ListItem>
              </Show>


              { requestIdsWithDiffs.length > 0 &&
              <ListSubheader> Endpoint Diffs </ListSubheader> }

              {requestIdsWithDiffs.map(requestId => {

                const {pathComponentId: pathId, httpMethod: method} = cachedQueryResults.requests[requestId].requestDescriptor;

                const path = <DisplayPathOnDark url={<PathIdToPathString pathId={pathId}/>} method={method}/>;

                const name = cachedQueryResults.contributions.getOrUndefined(requestId, PURPOSE);
                return (
                  <Link style={{textDecoration: 'none', color: 'black'}}
                        to={`${baseUrl}/diff/${sessionId}/paths/${pathId}/methods/${method}`}>
                    <ListItem dense button>
                      <ListItemText primary={path}/>
                    </ListItem>
                  </Link>
                );
              })}


            </List>

          </div>

        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
