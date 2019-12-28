import React, {useState} from 'react';
import {ListItemSecondaryAction, makeStyles, Typography} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import compose from 'lodash.compose';
import {RfcStore, withRfcContext} from '../../contexts/RfcContext';
import {getRequestIdsWithDiffs, getUnrecognizedUrlCount} from '../diff/DiffUtilities';
import {
  computeDiffStateProjections,
  TrafficSessionContext,
  TrafficSessionStore, withTrafficSessionContext
} from '../../contexts/TrafficSessionContext';
import {Link} from 'react-router-dom';
import {DisplayPath} from '../paths/DisplayPath';
import {PathIdToPathString} from '../paths/PathIdToPathString';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  ChangedYellowBackground, ChangedYellowBright, RemovedRed,
  RemovedRedBackground, UpdatedBlue, UpdatedBlueBackground
} from '../../contexts/ColorContext';
import classNames from 'classnames';
import {MarkdownRender} from '../requests/DocContribution';
import {PURPOSE} from '../../ContributionKeys';
import Chip from '@material-ui/core/Chip';
import Menu from '@material-ui/core/Menu';
import LinearProgress from '@material-ui/core/LinearProgress';
import {primary} from '../../theme';
import Collapse from '@material-ui/core/Collapse';
import {withIntegrationsContext} from '../../contexts/IntegrationsContext';
import {IntegrationsSpecService} from '../routes/local/integrations';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import {DocDivider} from '../requests/DocConstants';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {LightTooltip} from '../tooltips/LightTooltip';

const useStyles = makeStyles({
  section: {
    minHeight: 200,
    marginBottom: 110
  },
  chipNotif: {
    display: 'flex',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 160,
  },
  menuItem: {
    marginTop: 30
  },
  menuList: {
    width: 550,
    padding: 0,
    outline: 'none'
  },
  subheader: {
    textAlign: 'center',
    fontWeight: 800,
    color: 'white',

  },
  notificationBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    userSelect: 'none',
    backgroundColor: primary,
    borderRadius: 10,
    paddingBottom: 10,
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    '&:hover': {
      transition: 'background-color 0.2s ease',
      backgroundColor: '#3d4989'
    }
  },
  notification: {
    borderLeft: `5px solid ${AddedGreen}`,
    backgroundColor: AddedGreenBackground,
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 14,
    marginTop: 13,
    marginBottom: 13,
  },
  notifChip: {
    display: 'flex',
    flexDirection: 'row',
    marginRight: 7
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

function NewBehaviorCard({source, color, children}) {

  const classes = useStyles();

  const colorClass = color === 'red' ? classes.red : color === 'blue' ? classes.blue : classes.yellow;

  return (
    <div className={classNames(classes.notification, colorClass)}>
      <MarkdownRender source={source}/>
      {children}
    </div>
  );
}

function NewBehavior(props) {
  const classes = useStyles();
  const {sessionId, requestIdsWithDiffs, unrecognizedUrlCount, isIntegrationMode, integrationsWithDiff, cachedQueryResults, baseUrl, isLoading} = props;
  const [anchorEl, setAnchorEl] = useState(false);

  if (isLoading) {
    return null;
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const undocumentedBehavior = (
    <div className={classes.chipNotif} style={{marginTop: 0}}>
      <Chip label={requestIdsWithDiffs.length} size="small"
            style={{color: 'white', backgroundColor: RemovedRed}}/>
      <Typography variant="subtitle2" style={{color: 'white', marginLeft: 10, fontWeight: 200, fontSize: 12}}>Unexpected
        Behaviors</Typography>
    </div>
  );

  const newUrls = (
    <div className={classes.chipNotif}>
      <Chip label={unrecognizedUrlCount} size="small" style={{backgroundColor: ChangedYellowBright}}/>
      <Typography variant="subtitle2" style={{color: 'white', marginLeft: 10, fontWeight: 200, fontSize: 12}}>Undocumented
        URLs</Typography>
    </div>
  );


  const NotifChip = ({Icon, color, number, tooltip, disableTooltip, style = {}}) => {

    return (
      <LightTooltip title={tooltip} open={disableTooltip === true ? false : undefined}>
        <div style={{...style, pointerEvents: number === 0 && 'none', opacity: number === 0 && '.2'}}
             className={classes.notifChip}>
          <Icon style={{color}}/>
          <Typography variant="subtitle2"
                      style={{color, marginLeft: 3, fontSize: 16}}>{number > 0 && number}</Typography>
        </div>
      </LightTooltip>
    );
  };


  return (
    <Collapse in={true} appear={true} style={{width: '100%'}}>
      <div className={classes.notificationBar} onClick={handleClick} onMouseLeave={() => setAnchorEl(false)}>

        <Typography variant="subtitle1" style={{color: 'white', marginTop: 5}}>Not Synced</Typography>

        <div style={{display: 'flex', flexDirection: 'row'}}>
          <NotifChip Icon={VisibilityOffIcon} color={ChangedYellow} number={unrecognizedUrlCount}
                     tooltip={`${unrecognizedUrlCount} Undocumented URLs`}
                     disableTooltip={Boolean(anchorEl)}/>
          <NotifChip Icon={ReportProblemIcon} color={RemovedRed} number={requestIdsWithDiffs.length}
                     style={isIntegrationMode && {marginRight: 0}}
                     tooltip={`${requestIdsWithDiffs.length} Request Diffs`}
                     disableTooltip={Boolean(anchorEl)}/>
          {!isIntegrationMode &&
          <NotifChip Icon={SettingsEthernetIcon} color={UpdatedBlue} number={integrationsWithDiff.length}
                     style={{marginRight: 0}}
                     tooltip={`${integrationsWithDiff.length} Integrations with New Behavior`}
                     disableTooltip={Boolean(anchorEl)}/>}
        </div>

        <Collapse in={Boolean(anchorEl)} style={{width: '100%'}}>
          {unrecognizedUrlCount > 0 && (
            <Link style={{textDecoration: 'none', color: 'black', marginTop: 20}}
                  to={`${baseUrl}/diff/${sessionId}/urls`}>
              <List subheader={<ListSubheader className={classes.subheader} style={{color: ChangedYellow}}>Undocumented
                URLs</ListSubheader>}>
                <ListItem style={{textAlign: 'center'}}>
                  <Button color="default" size="small" variant="contained" style={{margin: '0 auto'}}>Document new
                    URLs</Button>
                </ListItem>
              </List>
            </Link>
          )}

          {requestIdsWithDiffs.length && (
            <>
              {unrecognizedUrlCount > 0 && <DocDivider/>}
              <List subheader={<ListSubheader className={classes.subheader} style={{color: RemovedRed}}>Request
                Diffs</ListSubheader>}>
                {requestIdsWithDiffs.map(requestId => {

                  const {pathComponentId: pathId, httpMethod: method} = cachedQueryResults.requests[requestId].requestDescriptor;

                  const path = <DisplayPath url={<PathIdToPathString pathId={pathId}/>} method={method}/>;

                  const name = cachedQueryResults.contributions.getOrUndefined(requestId, PURPOSE);
                  return (
                    <Link style={{textDecoration: 'none', color: 'black'}}
                          to={`${baseUrl}/diff/${sessionId}/requests/${requestId}`}>
                      <ListItem dense button>
                        <ListItemText primary={name || path}
                                      secondary={name && path}
                                      primaryTypographyProps={{
                                        style: {
                                          fontSize: 12,
                                          color: 'white'
                                        }
                                      }}/>
                      </ListItem>
                    </Link>
                  );
                })}
              </List>
            </>
          )}
          {integrationsWithDiff.length && (
            <>
              <DocDivider/>
              <List subheader={<ListSubheader className={classes.subheader}
                                              style={{color: UpdatedBlue}}>Integrations</ListSubheader>}>
                {integrationsWithDiff}
              </List>
            </>
          )}
        </Collapse>
      </div>
    </Collapse>
  );
}


class NewBehaviorWrapper extends React.Component {
  state = {
    isLoading: true,
    lastSessionId: null,
    error: null
  };

  componentDidMount() {
    this.loadLatestSession();
  }

  componentDidUpdate() {
    this.loadLatestSession();
  }

  loadLatestSession() {
    const {specService} = this.props;
    specService
      .listSessions()
      .then(async (listSessionsResponse) => {
        const {sessions} = listSessionsResponse;
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
    const {lastSessionId, isLoading, error} = this.state;
    if (error) {
      return null;
    }

    if (isLoading) {
      return (<NewBehavior isLoading={true}/>);
    }

    const {isEmpty} = this.props;
    if (!lastSessionId) {
      if (isEmpty) {
        return (
          <NewBehaviorCard color="blue" source={`#### Finish Setting up Optic
Optic has not observed any API traffic yet. Make sure you have set up the proxy properly and sent traffic through the API.`}>
            <Button variant="contained" style={{margin: 8}} href="https://docs.useoptic.com" target="_blank">Read
              Docs</Button>
            <Button variant="contained" style={{margin: 8}} onClick={() => window.drift.api.sidebar.open()}>Chat with
              Support</Button>
            <Button variant="contained" style={{margin: 8}} href="https://calendly.com/optic-onboarding/setup-help"
                    target="_blank">Schedule On-boarding Call</Button>
          </NewBehaviorCard>
        );
      }
      return null;
    }
    const {specService, baseUrl, integrations = [], isIntegrationMode} = this.props;
    return (
      <TrafficSessionStore sessionId={lastSessionId} specService={specService}>
        <TrafficSessionContext.Consumer>
          {(context) => {
            const {rfcId, rfcService} = this.props;
            const {cachedQueryResults, queries} = this.props;
            const {isLoading} = context;
            const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, {session: context.session});
            const rfcState = rfcService.currentState(rfcId);
            const requestIdsWithDiffs = getRequestIdsWithDiffs(rfcState, diffStateProjections);
            const unrecognizedUrlCount = getUnrecognizedUrlCount(rfcState, diffStateProjections);
            if (unrecognizedUrlCount === 0 && requestIdsWithDiffs.length === 0) {
              return null;
            }

            const integrationsInSession = new Set((context.session.integrationSamples || []).map(i => i.integrationName));

            const integrationsWithDiff = integrations.filter(i => integrationsInSession.has(i.name)).map(i => {
              const integrationsSpecService = new IntegrationsSpecService(i.name);

              const InteractionNotificationComponent = ({session, isLoading, rfcId, rfcService, cachedQueryResults, queries}) => {
                const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, {session: context.session});
                console.log('diff state projection ', diffStateProjections);

                const requestIdsWithDiffs = getRequestIdsWithDiffs(rfcState, diffStateProjections);
                const unrecognizedUrlCount = getUnrecognizedUrlCount(rfcState, diffStateProjections);
                if (unrecognizedUrlCount === 0 && requestIdsWithDiffs.length === 0) {
                  return null;
                }

                return (
                  <Link style={{textDecoration: 'none', color: 'black'}}
                    // to={`${baseUrl}/diff/${sessionId}/requests/${requestId}`}
                  >
                    <ListItem dense button component={Link}
                              to={`${baseUrl}/integrations/${encodeURIComponent(i.name)}`}>
                      <ListItemText primary={i.name}
                                    primaryTypographyProps={{
                                      style: {
                                        fontSize: 12,
                                        color: 'white'
                                      }
                                    }}/>
                    </ListItem>
                  </Link>
                );
              };

              const InteractionNotificationComponentWithContext = compose(withRfcContext, withTrafficSessionContext)(InteractionNotificationComponent);

              return (
                <RfcStore specService={integrationsSpecService}>
                  <TrafficSessionStore sessionId={lastSessionId} specService={integrationsSpecService}>
                    <div>
                      <InteractionNotificationComponentWithContext/>
                    </div>
                  </TrafficSessionStore>
                </RfcStore>
              );
            });

            return (
              <NewBehavior
                isLoading={isLoading}
                requestIdsWithDiffs={requestIdsWithDiffs}
                sessionId={lastSessionId}
                baseUrl={baseUrl}
                unrecognizedUrlCount={unrecognizedUrlCount}
                integrationsWithDiff={integrationsWithDiff}
                isIntegrationMode={isIntegrationMode}
                cachedQueryResults={cachedQueryResults}/>
            );
          }}
        </TrafficSessionContext.Consumer>

      </TrafficSessionStore>
    );
  }
}

export default compose(withRfcContext, withIntegrationsContext, withNavigationContext)(NewBehaviorWrapper);
