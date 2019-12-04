import React from 'react';
import { ListItemSecondaryAction, makeStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import compose from 'lodash.compose';
import { withRfcContext } from '../../contexts/RfcContext';
import { getRequestIdsWithDiffs, getUnrecognizedUrlCount } from '../diff/DiffUtilities';
import { computeDiffStateProjections, TrafficSessionContext, TrafficSessionStore } from '../../contexts/TrafficSessionContext';
import { Link } from 'react-router-dom';
import { DisplayPath } from '../paths/DisplayPath';
import { PathIdToPathString } from '../paths/PathIdToPathString';
import { withNavigationContext } from '../../contexts/NavigationContext';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  ChangedYellowBackground, RemovedRed,
  RemovedRedBackground, UpdatedBlue, UpdatedBlueBackground
} from '../../contexts/ColorContext';
import classNames from 'classnames';
import { MarkdownRender } from '../requests/DocContribution';
import { PURPOSE } from '../../ContributionKeys';

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
  blue: {
    borderLeft: `5px solid ${UpdatedBlue}`,
    backgroundColor: UpdatedBlueBackground,
  },
  container: {
    marginBottom: 40
  }
});

function NewBehaviorCard({ source, color, children }) {

  const classes = useStyles();

  const colorClass = color === 'red' ? classes.red : color === 'blue' ? classes.blue : classes.yellow

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
      `##### Unexpected API Behavior Observed
Optic has observed instances where your API does not follow the spec:
`}>
      <List style={{ maxWidth: 550 }}>
        {requestIdsWithDiffs.map(requestId => {

          const { pathComponentId: pathId, httpMethod: method } = cachedQueryResults.requests[requestId].requestDescriptor;

          const path = <DisplayPath url={<PathIdToPathString pathId={pathId} />} method={method} />

          const name = cachedQueryResults.contributions.getOrUndefined(requestId, PURPOSE);
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
    <NewBehaviorCard color="yellow" source={`#### Undocumented URLs Observed
Optic observed API traffic to ${unrecognizedUrlCount} undocumented URLs.`}>
      <Link style={{ textDecoration: 'none', color: 'black' }} to={`${baseUrl}/diff/${sessionId}/urls`}>
        <Button color="primary" size="small" style={{ marginTop: 22, marginBottom: 22 }} variant="contained">Review & Document</Button>
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
    this.loadLatestSession()
  }
  componentDidUpdate() {
    this.loadLatestSession()
  }

  loadLatestSession() {
    const { specService } = this.props;
    specService
      .listSessions()
      .then(async (listSessionsResponse) => {
        const { sessions } = listSessionsResponse;
        if (sessions.length > 0) {
          const [lastSessionId] = sessions;
          if (lastSessionId !== this.state.lastSessionId) {
            this.setState({
              isLoading: false,
              lastSessionId,
            });
          }
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
    const { lastSessionId, isLoading, error } = this.state;
    if (error) {
      return null;
    }

    if (isLoading) {
      return null;
    }

    const { isEmpty } = this.props
    if (!lastSessionId) {
      if (isEmpty) {
        return (
          <NewBehaviorCard color="blue" source={`#### Finish Setting up Optic
Optic has not observed any API traffic yet. Make sure you have set up the proxy properly and sent traffic through the API.`}>
            <Button variant="contained" style={{ margin: 8 }} href="https://docs.useoptic.com" target="_blank">Read Docs</Button>
            <Button variant="contained" style={{ margin: 8 }} onClick={() => window.drift.api.sidebar.open()}>Chat with Support</Button>
            <Button variant="contained" style={{ margin: 8 }} href="https://calendly.com/optic-onboarding/setup-help" target="_blank">Schedule On-boarding Call</Button>
          </NewBehaviorCard>
        )
      }
      return null;
    }
    const { specService } = this.props;


    return (
      <TrafficSessionStore sessionId={lastSessionId} specService={specService}>
        <TrafficSessionContext.Consumer>
          {(context) => {
            const { rfcId, rfcService } = this.props;
            const { cachedQueryResults, queries, baseUrl } = this.props;
            const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, { session: context.session });
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
            )
          }}
        </TrafficSessionContext.Consumer>

      </TrafficSessionStore>
    );
  }
}

export default compose(withRfcContext, withNavigationContext)(NewBehaviorWrapper);
