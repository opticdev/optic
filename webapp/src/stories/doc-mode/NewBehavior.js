import React from 'react';
import { CardContent, CardHeader, makeStyles, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { DocSubGroup } from './DocSubGroup';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import LabelImportantRoundedIcon from '@material-ui/icons/LabelImportantRounded';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import compose from 'lodash.compose';
import { withRfcContext } from '../../contexts/RfcContext';
import { getRequestIdsWithDiffs, getUnrecognizedUrlCount } from '../../components/diff-v2/DiffUtilities';
import { computeDiffStateProjections } from '../../contexts/TrafficAndDiffSessionContext';
import { specService } from '../../services/SpecService';

const useStyles = makeStyles({
  section: {
    minHeight: 200,
    marginBottom: 110
  }
});

function NewBehavior(props) {
  const classes = useStyles();

  return (
    <Card elevation={1} className={classes.section}>
      <CardHeader title={
        <>
          <Typography variant="h4" color="secondary">Undocumented Behavior Detected</Typography>
          <Typography variant="body1" style={{ marginTop: 5 }}>Optic detected some behavior in your API that does not
            match the current
            specification</Typography>
        </>
      } />
      <CardContent>
        <Grid container>

          <Grid item xs={12} md={6}>

            <DocSubGroup title="Request Diffs">
              <List>
                <ListItem button dense>
                  <ListItemAvatar style={{ marginTop: 4 }}>
                    <LabelImportantRoundedIcon color="secondary" />
                  </ListItemAvatar>
                  <ListItemText primary="Create New User" style={{ marginLeft: -15 }} />
                </ListItem>
                <ListItem button dense>
                  <ListItemAvatar style={{ marginTop: 4 }}>
                    <LabelImportantRoundedIcon color="secondary" />
                  </ListItemAvatar>
                  <ListItemText primary="Update a User's Password" style={{ marginLeft: -15 }} />
                </ListItem>

              </List>

            </DocSubGroup>

          </Grid>

          <Grid item xs={12} md={6}>

            <DocSubGroup title="Undocumented URLs">

              <Typography variant="body1" style={{ marginTop: 22 }}>Optic observed {34} requests to URLs that are not in your API specification.</Typography>


              <Button color="secondary" style={{ marginTop: 22 }} variant="contained">Document an API Request</Button>

            </DocSubGroup>

          </Grid>

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
  }
  componentDidMount() {
    const { specService } = this.props;
    specService
      .listSessions()
      .then(async (listSessionsResponse) => {
        const { sessions } = listSessionsResponse
        if (sessions.length > 0) {
          const [lastSessionId] = sessions;
          const session = await specService.loadSession(lastSessionId)
          this.setState({
            isLoading: false,
            lastSession: session
          })
        } else {
          this.setState({
            isLoading: false
          })
        }
      })
      .catch(e => {
        this.setState({
          isLoading: false,
          error: true
        })
      })
  }
  render() {
    const { lastSession, isLoading, error } = this.state;
    if (error) {
      return null
    }

    if (isLoading) {
      return null
    }

    if (!lastSession) {
      return null
    }

    const { rfcId, rfcService } = this.props;
    const { cachedQueryResults, queries } = this.props;
    debugger;
    const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, { session: lastSession.sessionResponse.session });
    const rfcState = rfcService.currentState(rfcId);
    const requestIdsWithDiffs = getRequestIdsWithDiffs(rfcState, diffStateProjections);
    const unrecognizedUrlCount = getUnrecognizedUrlCount(rfcState, diffStateProjections);
    debugger;
    if (unrecognizedUrlCount === 0 && requestIdsWithDiffs.length === 0) {
      return null
    }

    return (
      <NewBehavior requestIdsWithDiffs={requestIdsWithDiffs} unrecognizedUrlCount={unrecognizedUrlCount} />
    )
  }
}

export default compose(withRfcContext)(NewBehaviorWrapper)
