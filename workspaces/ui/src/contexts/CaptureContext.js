import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useServices } from './SpecServiceContext';
import { RfcContext, withRfcContext } from './RfcContext';
import {
  commandsToJson,
  CompareEquality,
  DiffResultHelper,
  JsonHelper,
  ScalaJSHelpers,
} from '@useoptic/domain';
import debounce from 'lodash.debounce';
export const CaptureContext = React.createContext(null);

export function useCaptureContext() {
  return useContext(CaptureContext);
}

const initialState = (debouncer = null) => {
  return {
    diffService: null,
    captureService: null,
    notificationChannel: null,
    config: null,
    additionalCommands: [],
    lastUpdate: null,
    pendingUpdates: false,
    completed: false,
    skipped: '0',
    processed: '0',

    reloadDebounce: debouncer,
    unrecognizedUrls: [],
    endpointDiffs: [],
  };
};

class _CaptureContextStore extends React.Component {
  state = initialState();

  componentDidMount = async () => {
    this.setState(
      {
        reloadDebounce: debounce(this.reload, 1000, {
          leading: true,
          maxWait: 1500,
        }),
      },
      async () => await this.startDiff()
    );
  };

  componentWillUnmount() {
    if (this.state.notificationChannel) {
      this.state.notificationChannel.close();
    }
  }

  reload = async (notifData) => {
    const notifDataUpdates = (() => {
      if (notifData && notifData.hasOwnProperty('hasMoreInteractions')) {
        if (!notifData.hasMoreInteractions) {
          console.log('completed diff');
        }
        return {
          completed: !notifData.hasMoreInteractions,
          skipped: notifData.skippedInteractionsCounter,
          processed: notifData.diffedInteractionsCounter,
        };
      } else {
        return {};
      }
    })();

    const { diffService } = this.state;

    if (diffService) {
      const [diffsResponse, urlsResponse] = await Promise.all([
        diffService.listDiffs(),
        diffService.listUnrecognizedUrls(),
      ]);

      console.log('results', [diffsResponse.diffs.length, urlsResponse.length]);
      this.setState({
        endpointDiffs: diffsResponse.diffs,
        unrecognizedUrls: urlsResponse,
        pendingUpdates: true,
        lastUpdate: new Date(),
        ...notifDataUpdates,
      });
    }
  };

  cleanupDiff = async () => {
    if (this.state.notificationChannel) {
      this.state.notificationChannel.close();
    }
    return await new Promise((resolve) => {
      this.setState(
        {
          unrecognizedUrls: [],
          endpointDiffs: [],
          lastUpdate: null,
          pendingUpdates: false,
          config: null,
          completed: false,
          skipped: '0',
          processed: '0',
        },
        resolve
      );
    });
  };

  startDiff = async () => {
    const {
      specService,
      captureServiceFactory,
      diffServiceFactory,
      captureId,
      eventStore,
      rfcId,
      rfcService,
      method,
      pathId,
    } = this.props;

    //clear diff
    await this.cleanupDiff();

    const captureService = await captureServiceFactory(specService, captureId);
    //@TODO: handle error
    const apiConfig = await specService.loadConfig();
    const events = eventStore.listEvents(rfcId);

    console.log('trying to start a new diff');
    const config = await captureService.startDiff(
      ScalaJSHelpers.eventsJsArray(events),
      apiConfig.config.ignoreRequests || [],
      commandsToJson(this.state.additionalCommands), //commands serialize me
      pathId && method ? [{ pathId, method }] : [] // partition diff when on an endpoint page
    );

    console.log('Starting new Diff ', config);

    let notificationChannel = null;
    if (config.notificationsUrl) {
      notificationChannel = new EventSource(config.notificationsUrl);
      notificationChannel.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (type === 'message') {
          this.state.reloadDebounce(data);
        } else if (type === 'error') {
          console.error(data);
          debugger;
        }
      };
      notificationChannel.onerror = (e) => {
        console.error(e);
      };
      notificationChannel.onopen = (e) => {
        console.log(e);
      };
    }

    const rfcState = rfcService.currentState(rfcId);

    const diffService = await diffServiceFactory(
      specService,
      captureService,
      rfcState,
      this.state.additionalCommands,
      config,
      captureId
    );

    this.setState(
      {
        config,
        diffService,
        captureService,
        notificationChannel,
        pendingUpdates: false,
      },
      () => this.reload()
    );
  };

  updatedAdditionalCommands = (additionalCommands) => {
    this.setState({ additionalCommands }, () => {
      this.startDiff();
    });
  };

  render = () => {
    const {
      pendingUpdates,
      unrecognizedUrls,
      endpointDiffs,
      lastUpdate,
      config,
      diffService,
      captureService,
      completed,
      skipped,
      processed,
    } = this.state;

    const endpointDiffsWithoutIgnored = CompareEquality.filterIgnored(
      endpointDiffs,
      this.props.ignoredDiffs
    );

    const value = {
      pendingUpdates,
      config,
      lastUpdate,
      endpointDiffs: endpointDiffsWithoutIgnored,
      unrecognizedUrls,
      diffService,
      captureService,
      completed,
      skipped,
      processed,
      updatedAdditionalCommands: this.updatedAdditionalCommands,
    };

    return (
      <CaptureContext.Provider value={value}>
        {this.props.children}
      </CaptureContext.Provider>
    );
  };
}

export const CaptureContextStore = withRfcContext(_CaptureContextStore);
