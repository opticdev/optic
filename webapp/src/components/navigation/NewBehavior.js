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
import {SummaryStatus} from '../dashboards/APIDashboard';
import CheckIcon from '@material-ui/icons/Check';

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

  if (requestIdsWithDiffs.length === 0 && unrecognizedUrlCount === 0) {
    return (
      <Collapse in={true} appear={true} style={{width: '100%'}}>
        <div className={classes.notificationBar}>
          <Typography variant="subtitle1" style={{color: 'white', marginTop: 8}}> <CheckIcon style={{color: AddedGreen, fontSize: 16, paddingTop: 4, marginLeft: -5}}/>In-Sync</Typography>
        </div>
      </Collapse>
    )
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
          {/*{!isIntegrationMode &&*/}
          {/*<NotifChip Icon={SettingsEthernetIcon} color={UpdatedBlue} number={integrationsWithDiff.length}*/}
          {/*           style={{marginRight: 0}}*/}
          {/*           tooltip={`${integrationsWithDiff.length} Integrations with New Behavior`}*/}
          {/*           disableTooltip={Boolean(anchorEl)}/>}*/}
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

          {requestIdsWithDiffs.length > 0 && (
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
          {/*{integrationsWithDiff.length > 0 ? (*/}
          {/*  <>*/}
          {/*    <DocDivider/>*/}
          {/*    <List subheader={<ListSubheader className={classes.subheader}*/}
          {/*                                    style={{color: UpdatedBlue}}>Integrations</ListSubheader>}>*/}
          {/*      {integrationsWithDiff}*/}
          {/*    </List>*/}
          {/*  </>*/}
          {/*): null}*/}
        </Collapse>
      </div>
    </Collapse>
  );
}


class NewBehaviorWrapperBase extends React.Component {
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
    //
    // const {isEmpty} = this.props;
    // if (!lastSessionId) {
    //   if (isEmpty) {
    //     return (
    //       <div>EMPTYYY FHJKDSHFJKSHFDK</div>
    //     );
    //   }
    //   return <div>EMPTYYY A</div>;
    // }

    const {specService, baseUrl, children, renderNoSession} = this.props;
    return (
      <TrafficSessionStore sessionId={lastSessionId} specService={specService} renderNoSession={renderNoSession}>
        <TrafficSessionContext.Consumer>
          {(context) => {
            const {rfcId, rfcService} = this.props;
            const {cachedQueryResults, queries} = this.props;
            const {isLoading} = context;
            const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, {session: context.session});
            const rfcState = rfcService.currentState(rfcId);
            const requestIdsWithDiffs = getRequestIdsWithDiffs(rfcState, diffStateProjections);
            const unrecognizedUrlCount = getUnrecognizedUrlCount(rfcState, diffStateProjections);

            return (<>
              {children({
                isLoading,
                requestIdsWithDiffs,
                lastSessionId,
                baseUrl,
                unrecognizedUrlCount,
                cachedQueryResults,
                session: context.session
              })}
            </>);
          }}
        </TrafficSessionContext.Consumer>

      </TrafficSessionStore>
    );
  }
}

export const NewBehaviorWrapper = compose(withRfcContext, withIntegrationsContext, withNavigationContext)(NewBehaviorWrapperBase);

export const NewBehaviorSideBar = () => (
  <NewBehaviorWrapper>
    {({isLoading, requestIdsWithDiffs, lastSessionId, baseUrl, unrecognizedUrlCount, cachedQueryResults}) => {
      return <NewBehavior
        isLoading={isLoading}
        requestIdsWithDiffs={requestIdsWithDiffs}
        sessionId={lastSessionId}
        baseUrl={baseUrl}
        unrecognizedUrlCount={unrecognizedUrlCount}
        cachedQueryResults={cachedQueryResults}/>;
    }}
  </NewBehaviorWrapper>
);

export const HasDiffRequestToolBar = ({requestId}) => (
  <NewBehaviorWrapper>
    {({isLoading, requestIdsWithDiffs, lastSessionId, baseUrl, unrecognizedUrlCount, cachedQueryResults}) => {

      if (!isLoading) {
        const hasDiff = !requestIdsWithDiffs.includes(requestId);
        return (
          <Button style={{textDecoration: 'none'}} size="small" component={Link}
                  to={`${baseUrl}/diff/${lastSessionId}/requests/${requestId}`} disabled={hasDiff}>
            <SummaryStatus on={hasDiff} onText="In-Sync" offText="Endpoint Has Diff"/>
          </Button>
        );
      }
    }}
  </NewBehaviorWrapper>
);

export const HasDiffDashboard = ({requestId}) => (
  <NewBehaviorWrapper>
    {({isLoading, requestIdsWithDiffs, lastSessionId, baseUrl, unrecognizedUrlCount, cachedQueryResults}) => {

      if (!isLoading) {
        const hasRequestDiff = requestIdsWithDiffs.length > 0

        return (<>
            <SummaryStatus on={!hasRequestDiff} onText="In-Sync" offText="API & Spec are not In-Sync"/>
            <SummaryStatus on={unrecognizedUrlCount === 0} onText="No Undocumented URLs" offText="Undocumented Endpoints Detected"/>
          </>
        );
      }
    }}
  </NewBehaviorWrapper>
);
