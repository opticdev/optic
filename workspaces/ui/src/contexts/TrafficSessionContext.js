import React from 'react';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withRfcContext} from './RfcContext.js';
import compose from 'lodash.compose';
import {BaseDiffSessionManager} from '../components/diff/BaseDiffSessionManager.js';
import LoadingDiff from '../components/diff/LoadingDiff.js';
import {DiffManagerFacade} from '@useoptic/domain';

const {
  Context: TrafficSessionContext,
  withContext: withTrafficSessionContext
} = GenericContextFactory(null);

class TrafficSessionStoreBase extends React.Component {
  state = {
    isLoading: true,
    session: null,
    error: null,
    diffManager: null
  };

  componentDidMount() {
    this.setState({
      isLoading: true,
      error: null,
      session: null,
      diffManager: DiffManagerFacade.newFromInteractions([], () => {
        this.forceUpdate()
      })
    });
    const {specService, sessionId} = this.props;

    if (!sessionId) {
      this.setState({
        noSession: true,
        isLoading: false
      });
      return;
    }

    specService
      .listCapturedSamples(sessionId)
      .then(result => {
        const session = result;
        this.setState({
          session,
          isLoading: false,
          error: null,
          noSession: false,
        });
        this.checkForUpdates();

        DiffManagerFacade.updateInteractions(session.samples, this.state.diffManager)
        const numberOfX = this.state.diffManager.inputStats
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          isLoading: false,
          error: e,
          // diffSessionManager: null
        });

        DiffManagerFacade.updateInteractions([], this.state.diffManager)
      });
  }

  checkForUpdates() {
    setTimeout(async () => {
      const {specService, sessionId} = this.props;

      if (!sessionId) {
        return;
      }

      try {
        const result = await specService.listCapturedSamples(sessionId);
        const {session} = this.state;
        const latestSession = result;
        if (!session) {
          this.checkForUpdates();

          return;
        }
        if (latestSession.samples.length > session.samples.length) {
          this.setState({
            session: latestSession,
          });
          DiffManagerFacade.updateInteractions(session.samples, this.state.diffManager)
        }
        //@TODO: add flag prop to disable checking for updates?
        if (latestSession.metadata.completed !== true) {
          this.checkForUpdates();
        }
      } catch (e) {
        console.error(e);
        //@GOTCHA: server will throw a 400 if capture is no longer active. could change this behavior in server or just update ui state
      }
    }, 1000);
  }

  render() {
    const {sessionId, children, renderNoSession} = this.props;
    const {queries, cachedQueryResults} = this.props;
    const {isLoading, error, session, noSession, diffManager} = this.state;

    if (isLoading) {
      return null;
    }

    if (noSession) {
      return renderNoSession || null;
    }

    if (error) {
      console.error(error);
      return <div></div>;
    }

    const context = {
      sessionId,
      session,
      diffManager
    };

    return (
      <TrafficSessionContext.Provider value={context}>
        {children}
      </TrafficSessionContext.Provider>
    );
  }
}

const TrafficSessionStore = compose(withRfcContext)(TrafficSessionStoreBase);

export {
  TrafficSessionStore,
  TrafficSessionContext,
  withTrafficSessionContext
};
