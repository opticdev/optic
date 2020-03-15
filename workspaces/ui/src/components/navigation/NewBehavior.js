import React from 'react';
import Button from '@material-ui/core/Button';
import compose from 'lodash.compose';
import {withRfcContext} from '../../contexts/RfcContext';
import {getRequestIdsWithDiffs, getUnrecognizedUrlCount} from '../diff/DiffUtilities';
import {
  TrafficSessionContext,
  TrafficSessionStore
} from '../../contexts/TrafficSessionContext';
import {Link} from 'react-router-dom';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {SummaryStatus} from '../dashboards/APIDashboard';
import LocalDoesNotMatch from './LocalDoesNotMatch';
import {BaseDiffSessionManager} from '../diff/BaseDiffSessionManager';


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
      return null;
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
            const diffSessionManager = new BaseDiffSessionManager(lastSessionId, context.session, specService);
            // const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, diffSessionManager);
            // const rfcState = rfcService.currentState(rfcId);
            const requestIdsWithDiffs = []
            const unrecognizedUrlCount = 0

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
    {({lastSessionId, baseUrl}) => {
      return (
        <Link
          style={{textDecoration: 'none', color: 'black', marginTop: 20}}
          to={`${baseUrl}/diff/${lastSessionId}/urls`}>
          {children}
        </Link>
      );
    }}
  </NewBehaviorWrapper>
);


export const HasDiffRequestToolBar = ({requestId}) => (
  <NewBehaviorWrapper>
    {({isLoading, requestIdsWithDiffs, lastSessionId, baseUrl}) => {

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
    {({isLoading, requestIdsWithDiffs, unrecognizedUrlCount}) => {

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
