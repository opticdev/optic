import React from 'react';
import { ListItemSecondaryAction, makeStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import compose from 'lodash.compose';
import { withRfcContext } from '../../contexts/RfcContext';
import { getRequestIdsWithDiffs, getUnrecognizedUrlCount } from '../../components/diff-v2/DiffUtilities';
import { computeDiffStateProjections } from '../../contexts/TrafficAndDiffSessionContext';
import { Link } from 'react-router-dom';
import { DisplayPath } from './DisplayPath';
import { PathIdToPathString } from './PathIdToPathString';
import { withNavigationContext } from '../../contexts/NavigationContext';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  ChangedYellowBackground, RemovedRed,
  RemovedRedBackground
} from '../../contexts/ColorContext';
import classNames from 'classnames';
import { MarkdownRender } from './DocContribution';

const useStyles = makeStyles({
  section: {
    minHeight: 200,
    marginBottom: 110
  },
  card: {
    borderLeft: `5px solid ${AddedGreen}`,
    backgroundColor: AddedGreenBackground,
    paddingLeft: 12,
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 14,
    marginRight: 10,
    marginTop: 13,
    marginBottom: 13,
  },
  yellow: {
    borderLeft: `5px solid ${ChangedYellow}`,
    backgroundColor: ChangedYellowBackground,
  },
  red: {
    borderLeft: `5px solid ${RemovedRed}`,
    backgroundColor: RemovedRedBackground,
  },
  container: {
    marginBottom: 40
  }
});

function NewBehaviorCard({ source, color, children }) {

  const classes = useStyles();

  const colorClass = color === 'red' ? classes.red : classes.yellow;

  return (
    <div className={classNames(classes.card, colorClass)}>
      <MarkdownRender source={source} />
      {children}
    </div>
  );
}

function NewBehavior(props) {
  const classes = useStyles();

  const { sessionId, requestIdsWithDiffs, unrecognizedUrlCount, cachedQueryResults, baseUrl } = props;

  const undocumentedBehavior = (
    <NewBehaviorCard color="red" source={
      `#### Undocumented API Behavior Observed
Optic has observed several instances where your API does not follow the spec:
`}>
      <List style={{ maxWidth: 550 }}>
        {requestIdsWithDiffs.map(requestId => {

          const { pathComponentId: pathId, httpMethod: method } = cachedQueryResults.requests[requestId].requestDescriptor;

          const path = <DisplayPath url={<PathIdToPathString pathId={pathId} />} method={method} />

          const name = cachedQueryResults.contributions.getOrUndefined(requestId, 'purpose');
          return (
            <ListItem dense>
              <ListItemText primary={name || path}
                secondary={name && path}
                primaryTypographyProps={{
                  style: {
                    fontSize: 16
                  }
                }} />
              <ListItemSecondaryAction>
                <Link style={{ textDecoration: 'none', color: 'black' }} to={`${baseUrl}/diff/${sessionId}/requests/${requestId}`}>
                  <Button size="small" color="primary" variant="contained">Review Diff</Button>
                </Link>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}

      </List>
    </NewBehaviorCard>
  );

  const newUrls = (
    <NewBehaviorCard color="yellow" source={`#### Optic observed ${unrecognizedUrlCount} requests to URLs that are not in your API specification
Click the button below to add these new URLs as paths in your specification`}>
      <Link style={{ textDecoration: 'none', color: 'black' }} to={`${baseUrl}/diff/${sessionId}/urls`}>
        <Button color="primary" size="small" style={{ marginTop: 22, marginBottom: 22 }} variant="contained">Document New API
          Request</Button>
      </Link>
    </NewBehaviorCard>
  );


  return (
    <div className={classes.container}>
      {requestIdsWithDiffs.length > 0 && undocumentedBehavior}
      {unrecognizedUrlCount > 0 && newUrls}
    </div>
  );
}


class NewBehaviorWrapper extends React.Component {
  state = {
    isLoading: true,
    lastSessionId: null,
    error: null
  };

  componentDidMount() {
    const { specService } = this.props;
    specService
      .listSessions()
      .then(async (listSessionsResponse) => {
        const { sessions } = listSessionsResponse;
        if (sessions.length > 0) {
          const [lastSessionId] = sessions;
          const session = await specService.loadSession(lastSessionId);
          this.setState({
            isLoading: false,
            lastSessionId,
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
    const { lastSession, lastSessionId, isLoading, error } = this.state;
    if (error) {
      return null;
    }

    if (isLoading) {
      return null;
    }

    if (!lastSession) {
      return null;
    }

    const { rfcId, rfcService } = this.props;
    const { cachedQueryResults, queries, baseUrl } = this.props;
    const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, { session: lastSession.sessionResponse.session });
    const rfcState = rfcService.currentState(rfcId);
    const requestIdsWithDiffs = getRequestIdsWithDiffs(rfcState, diffStateProjections);
    const unrecognizedUrlCount = getUnrecognizedUrlCount(rfcState, diffStateProjections);
    if (unrecognizedUrlCount === 0 && requestIdsWithDiffs.length === 0) {
      return null;
    }

    return (
      <NewBehavior
        requestIdsWithDiffs={requestIdsWithDiffs}
        sessionId={lastSessionId}
        baseUrl={baseUrl}
        unrecognizedUrlCount={unrecognizedUrlCount}
        cachedQueryResults={cachedQueryResults} />
    );
  }
}

export default compose(withRfcContext, withNavigationContext)(NewBehaviorWrapper);
