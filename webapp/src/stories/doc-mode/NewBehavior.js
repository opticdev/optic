import React from 'react';
import {CardContent, CardHeader, makeStyles, Typography} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import {DocSubGroup} from './DocSubGroup';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import LabelImportantRoundedIcon from '@material-ui/icons/LabelImportantRounded';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import compose from 'lodash.compose';
import {withRfcContext} from '../../contexts/RfcContext';
import {getRequestIdsWithDiffs, getUnrecognizedUrlCount} from '../../components/diff-v2/DiffUtilities';
import {computeDiffStateProjections} from '../../contexts/TrafficAndDiffSessionContext';
import {specService} from '../../services/SpecService';
import {Link} from 'react-router-dom';
import {DisplayPath} from './DisplayPath';
import {PathIdToPathString} from './PathIdToPathString';
import {withNavigationContext} from '../../contexts/NavigationContext';

const useStyles = makeStyles({
  section: {
    minHeight: 200,
    marginBottom: 110
  }
});

function NewBehavior(props) {
  const classes = useStyles();

  const {requestIdsWithDiffs, unrecognizedUrlCount, cachedQueryResults, baseUrl} = props;

  return (
    <Card elevation={1} className={classes.section}>
      <CardHeader title={
        <>
          <Typography variant="h4" color="secondary">Undocumented Behavior Detected</Typography>
          <Typography variant="body1" style={{marginTop: 5}}>Optic detected some behavior in your API that does not
            match the current
            specification</Typography>
        </>
      }/>
      <CardContent>
        <Grid container spacing={8}>

          <Grid item xs={12} md={6}>

            <DocSubGroup title="Request Diffs">
              <List>
                {requestIdsWithDiffs.map(requestId => {

                  const {pathComponentId: pathId, httpMethod: method} = cachedQueryResults.requests[requestId].requestDescriptor;
                  const path = <DisplayPath url={<PathIdToPathString pathId={pathId}/>} method={method}/>;
                  const name = cachedQueryResults.contributions.getOrUndefined(requestId, 'purpose');

                  return (
                    <Link style={{textDecoration: 'none', color: 'black'}} to={`${baseUrl}/diff/requests/${requestId}`}>
                      <ListItem button dense>
                        <ListItemAvatar style={{marginTop: 4}}>
                          <LabelImportantRoundedIcon color="secondary"/>
                        </ListItemAvatar>
                        <ListItemText primary={name || path} secondary={name && path} style={{marginLeft: -15}}/>
                      </ListItem>
                    </Link>
                  );
                })}

              </List>

            </DocSubGroup>

          </Grid>


          {unrecognizedUrlCount > 0 && (
            <Grid item xs={12} md={6}>

              <DocSubGroup title="Undocumented URLs">
                <Typography variant="body1" style={{marginTop: 22}}>Optic observed {unrecognizedUrlCount} requests to
                  URLs that are not in your API specification.</Typography>

                <Link style={{textDecoration: 'none', color: 'black'}} to={`${baseUrl}/diff/urls`}>
                  <Button color="secondary" style={{marginTop: 22}} variant="contained">Document an API Request</Button>
                </Link>
              </DocSubGroup>

            </Grid>
          )}

        </Grid>
      </CardContent>
    </Card>
  );
}


class NewBehaviorWrapper extends React.Component {
  state = {
    isLoading: true,
    lastSessionId: null,
    error: null
  };

  componentDidMount() {
    const {specService} = this.props;
    specService
      .listSessions()
      .then(async (listSessionsResponse) => {
        const {sessions} = listSessionsResponse;
        if (sessions.length > 0) {
          const [lastSessionId] = sessions;
          const session = await specService.loadSession(lastSessionId);
          this.setState({
            isLoading: false,
            lastSession: session
          });
        } else {
          this.setState({
            isLoading: false
          });
        }
      })
      .catch(e => {
        this.setState({
          isLoading: false,
          error: true
        });
      });
  }

  render() {
    const {lastSession, isLoading, error} = this.state;
    if (error) {
      return null;
    }

    if (isLoading) {
      return null;
    }

    if (!lastSession) {
      return null;
    }

    const {rfcId, rfcService} = this.props;
    const {cachedQueryResults, queries, baseUrl} = this.props;
    const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, {session: lastSession.sessionResponse.session});
    const rfcState = rfcService.currentState(rfcId);
    const requestIdsWithDiffs = getRequestIdsWithDiffs(rfcState, diffStateProjections);
    const unrecognizedUrlCount = getUnrecognizedUrlCount(rfcState, diffStateProjections);
    if (unrecognizedUrlCount === 0 && requestIdsWithDiffs.length === 0) {
      return null;
    }

    return (
      <NewBehavior requestIdsWithDiffs={requestIdsWithDiffs}
                   baseUrl={baseUrl}
                   unrecognizedUrlCount={unrecognizedUrlCount}
                   cachedQueryResults={cachedQueryResults}/>
    );
  }
}

export default compose(withRfcContext, withNavigationContext)(NewBehaviorWrapper);
