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
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import {DocDivider} from '../requests/DocConstants';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {LightTooltip} from '../tooltips/LightTooltip';
import {SummaryStatus} from '../dashboards/APIDashboard';
import CheckIcon from '@material-ui/icons/Check';
import LocalDoesNotMatch from './LocalDoesNotMatch';
import {BaseDiffSessionManager} from '../diff/BaseDiffSessionManager';

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
      .listCaptures()
      .then(async (listCapturesResponse) => {
        const {captures} = listCapturesResponse;
        if (captures.length > 0) {
          const [lastSessionId] = captures;
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
      return null
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
            const diffSessionManager = new BaseDiffSessionManager(lastSessionId, context.session, specService)
            const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, diffSessionManager);
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

export const NewBehaviorWrapper = compose(withRfcContext, withNavigationContext)(NewBehaviorWrapperBase);

export const NewBehaviorSideBar = () => (
  <NewBehaviorWrapper>
    {({isLoading, requestIdsWithDiffs, lastSessionId, baseUrl, unrecognizedUrlCount, cachedQueryResults}) => {
      return <LocalDoesNotMatch
        isLoading={isLoading}
        requestIdsWithDiffs={requestIdsWithDiffs}
        sessionId={lastSessionId}
        baseUrl={baseUrl}
        unrecognizedUrlCount={unrecognizedUrlCount}
        cachedQueryResults={cachedQueryResults}/>;
    }}
  </NewBehaviorWrapper>
);
export const LinkToDocumentUrls = ({children}) => (
  <NewBehaviorWrapper>
    {({isLoading, requestIdsWithDiffs, lastSessionId, baseUrl, unrecognizedUrlCount, cachedQueryResults}) => {
      return (
        <Link style={{textDecoration: 'none', color: 'black', marginTop: 20}}
              to={`${baseUrl}/diff/${lastSessionId}/urls`}>
          {children}
        </Link>
      );
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
        const hasRequestDiff = requestIdsWithDiffs.length > 0;

        return (<>
            <SummaryStatus on={!hasRequestDiff} onText="In-Sync" offText="API & Spec are not In-Sync"/>
            <SummaryStatus on={unrecognizedUrlCount === 0} onText="No Undocumented URLs"
                           offText="Undocumented Endpoints Detected"/>
          </>
        );
      }
    }}
  </NewBehaviorWrapper>
);
