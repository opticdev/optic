import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useServices } from './SpecServiceContext';
import { RfcContext } from './RfcContext';
import { ScalaJSHelpers } from '@useoptic/domain';
import debounce from 'lodash.debounce';
export const CaptureContext = React.createContext(null);

export function useCaptureContext() {
  return useContext(CaptureContext);
}

const initialState = () => {
  return {
    diffService: null,
    captureService: null,
    notificationChannel: null,
    config: null,
    additionalCommands: [],
    lastUpdate: null,
    pendingUpdates: false,

    reloadDebounce: null,
    unrecognizedUrls: [],
    endpointDiffs: [],
  };
};

export class CaptureStateStore extends React.Component {
  state = initialState();

  componentDidMount = async () => {
    this.setState(
      {
        reloadDebounce: debounce(this.reload, 1000, { leading: true }),
      },
      async () => await this.startDiff()
    );
  };

  componentWillUnmount() {
    if (this.state.notificationChannel) {
      this.state.notificationChannel.close();
    }
  }

  reload = async () => {
    this.setState({ pendingUpdates: true, lastUpdate: new Date() });

    const { diffService } = this.state;

    if (diffService) {
      const [diffsResponse, urlsResponse] = await Promise.all([
        diffService.listDiffs(),
        diffService.listUnrecognizedUrls(),
      ]);

      console.log('results', [
        diffsResponse.diffs.length,
        urlsResponse.urls.length,
      ]);

      this.setState({
        endpointDiffs: diffsResponse.diffs,
        unrecognizedUrls: urlsResponse.urls,
      });
    }
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
    } = this.props;

    const captureService = await captureServiceFactory(specService, captureId);
    //@TODO: handle error
    const apiConfig = await specService.loadConfig();
    const events = eventStore.listEvents(rfcId);
    const config = await captureService.startDiff(
      ScalaJSHelpers.eventsJsArray(events),
      apiConfig.config.ignoreRequests || [],
      this.state.additionalCommands
    );

    let notificationChannel = null;
    if (config.notificationsUrl) {
      notificationChannel = new EventSource(config.notificationsUrl);
      notificationChannel.onmessage = (event) => {
        this.state.reloadDebounce();
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

    this.setState({
      config,
      diffService,
      captureService,
      notificationChannel,
      pendingUpdates: false,
    });
  };

  render = () => {
    const {
      pendingUpdates,
      unrecognizedUrls,
      endpointDiffs,
      lastUpdate,
      config,
    } = this.state;
    const value = {
      pendingUpdates,
      config,
      lastUpdate,
      endpointDiffs,
      unrecognizedUrls,
    };

    return (
      <CaptureContext.Provider value={value}>
        {JSON.stringify(value)}
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
