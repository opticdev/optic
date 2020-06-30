import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useServices } from './SpecServiceContext';
import { RfcContext } from './RfcContext';
import { commandsToJson, ScalaJSHelpers } from '@useoptic/domain';
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

export class CaptureStateStore extends React.Component {
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
      try {
        const [diffsResponse, urlsResponse] = await Promise.all([
          diffService.listDiffs(),
          diffService.listUnrecognizedUrls(),
        ]);

        console.log('results', [
          diffsResponse.diffs.length,
          urlsResponse.length,
        ]);
        this.setState({
          endpointDiffs: diffsResponse.diffs,
          unrecognizedUrls: urlsResponse,
          pendingUpdates: true,
          lastUpdate: new Date(),
          ...notifDataUpdates,
        });
      } catch (e) {
        console.error('issue with reload, skipping', e);
      }
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
        const { data } = JSON.parse(event.data);
        this.state.reloadDebounce(data);
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

    const value = {
      pendingUpdates,
      config,
      lastUpdate,
      endpointDiffs,
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
        {/*{JSON.stringify({*/}
        {/*  pendingUpdates,*/}
        {/*  lastUpdate,*/}
        {/*  endpointDiffs: endpointDiffs.length,*/}
        {/*  unrecognizedUrls: unrecognizedUrls.length,*/}
        {/*})}*/}
        {this.props.children}
      </CaptureContext.Provider>
    );
  };
}

// export function CaptureStateStore(props) {
//   const { captureId } = props;
//
//   const [diffService, setDiffService] = useState(null);
//   const [captureService, setCaptureService] = useState(null);
//   const [additionalCommands, setAdditionalCommands] = useState([]);
//
//   const { eventStore, rfcService, rfcId } = useContext(RfcContext);
//
//   // diff state
//   const [endpointDiffs, setEndpointDiffs] = useState([]);
//   const [unrecognizedUrls, setUnrecognizedUrls] = useState([]);
//   const [stats, setStats] = useState({});
//   const [diffId, setDiffId] = useState('');
//
//   const {
//     specService,
//     captureServiceFactory,
//     diffServiceFactory,
//   } = useServices();
//
//   async function restart() {
//     if (diffService) {
//       diffService.loadStats().then(setStats);
//       diffService.listDiffs().then((x) => {
//         setEndpointDiffs(x.diffs);
//       });
//       diffService.listUnrecognizedUrls().then((x) => {
//         setUnrecognizedUrls(x.urls);
//       });
//       setDiffId(diffService.diffId());
//     }
//   }
//   useEffect(() => {
//     let notifications;
//     async function task() {
//       const captureService = await captureServiceFactory(
//         specService,
//         captureId
//       );
//       //@TODO: handle error
//       const apiConfig = await specService.loadConfig();
//       const events = eventStore.listEvents(rfcId);
//       const config = await captureService.startDiff(
//         ScalaJSHelpers.eventsJsArray(events),
//         apiConfig.config.ignoreRequests || [],
//         additionalCommands
//       );
//       if (config.notificationsUrl) {
//         const notificationsSource = new EventSource(config.notificationsUrl);
//         notificationsSource.onmessage = (event) => {
//           debugger;
//         };
//         notificationsSource.onerror = (e) => {
//           console.error(e);
//         };
//         notificationsSource.onopen = (e) => {
//           console.log(e);
//         };
//       }
//       const rfcState = rfcService.currentState(rfcId);
//
//       const diffServiceForCapture = await diffServiceFactory(
//         specService,
//         captureService,
//         rfcState,
//         additionalCommands,
//         config,
//         captureId
//       );
//       setCaptureService(captureService);
//       setDiffService(diffServiceForCapture);
//     }
//     task();
//     return function cleanup() {
//       if (notifications) {
//         notifications.close();
//       }
//     };
//   }, [captureId, additionalCommands]);
//
//   useEffect(() => {
//     restart();
//     return () => {};
//   }, [diffService]);
//
//   if (!diffService) {
//     return <div>loading...</div>;
//   }
//
//   const updatedAdditionalCommands = (additionalCommands) => {
//     setAdditionalCommands(additionalCommands);
//   };
//
//   const value = {
//     diffService,
//     captureService,
//     restart,
//     updatedAdditionalCommands,
//     diffId,
//     endpointDiffs,
//     unrecognizedUrls,
//     stats,
//   };
//
//   return (
//     <CaptureContext.Provider value={value}>
//       {props.children}
//     </CaptureContext.Provider>
//   );
// }
