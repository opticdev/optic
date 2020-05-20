import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import compose from 'lodash.compose';
import { DiffManagerFacade } from '@useoptic/domain';

const {
  Context: TrafficSessionContext,
  withContext: withTrafficSessionContext,
} = GenericContextFactory(null);

class TrafficSessionStoreBase extends React.Component {
  state = {
    isLoading: true,
    session: null,
    error: null,
    diffManager: null,
  };

  componentDidMount() {
    this.setState({
      isLoading: true,
      error: null,
      session: null,
      diffManager: DiffManagerFacade.newFromInteractions([], () => {
        this.forceUpdate();
      }),
    });
    const { specService, sessionId } = this.props;

    if (!sessionId) {
      this.setState({
        noSession: true,
        isLoading: false,
      });
      return;
    }

    specService
      .listCapturedSamples(sessionId)
      .then((result) => {
        const session = result;
        this.setState({
          session,
          isLoading: false,
          error: null,
          noSession: false,
        });
        DiffManagerFacade.updateInteractions(
          session.samples,
          this.state.diffManager
        );

        this.checkForUpdates();
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          isLoading: false,
          error: e,
          // diffSessionManager: null
        });

        DiffManagerFacade.updateInteractions([], this.state.diffManager);
      });
  }

  checkForUpdates() {
    setTimeout(async () => {
      const { specService, sessionId } = this.props;

      if (!sessionId) {
        return;
      }

      try {
        const { status } = await specService.getCaptureStatus(sessionId);
        const result = await specService.listCapturedSamples(sessionId);
        const { session } = this.state;
        const latestSession = result;
        if (!session) {
          this.checkForUpdates();

          return;
        }
        if (latestSession.samples.length > session.samples.length) {
          this.setState({
            session: latestSession,
          });
          DiffManagerFacade.updateInteractions(
            session.samples,
            this.state.diffManager
          );
        }
        //@TODO: add flag prop to disable checking for updates?
        if (status !== 'completed') {
          this.checkForUpdates();
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  }

  render() {
    const { sessionId, children, renderNoSession } = this.props;
    const { isLoading, error, session, noSession, diffManager } = this.state;

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
      diffManager,
    };

    return (
      <TrafficSessionContext.Provider value={context}>
        {children}
      </TrafficSessionContext.Provider>
    );
  }
}

const TrafficSessionStore = compose()(TrafficSessionStoreBase);

export {
  TrafficSessionStore,
  TrafficSessionContext,
  withTrafficSessionContext,
};
