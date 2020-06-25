import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useServices } from './SpecServiceContext';
import { RfcContext } from './RfcContext';
import { ScalaJSHelpers } from '@useoptic/domain';

export const CaptureContext = React.createContext(null);

export function useCaptureContext() {
  return useContext(CaptureContext);
}

export function CaptureStateStore(props) {
  const { captureId } = props;

  const [diffService, setDiffService] = useState(null);
  const [captureService, setCaptureService] = useState(null);
  const [additionalCommands, setAdditionalCommands] = useState([]);

  const { eventStore, rfcService, rfcId } = useContext(RfcContext);

  // diff state
  const [endpointDiffs, setEndpointDiffs] = useState([]);
  const [unrecognizedUrls, setUnrecognizedUrls] = useState([]);
  const [stats, setStats] = useState({});
  const [diffId, setDiffId] = useState('');

  const {
    specService,
    captureServiceFactory,
    diffServiceFactory,
  } = useServices();

  async function restart() {
    if (diffService) {
      diffService.loadStats().then(setStats);
      diffService.listDiffs().then((x) => {
        setEndpointDiffs(x.diffs);
      });
      diffService.listUnrecognizedUrls().then((x) => {
        setUnrecognizedUrls(x.urls);
      });
      setDiffId(diffService.diffId());
    }
  }
  useEffect(() => {
    async function task() {
      const captureService = await captureServiceFactory(
        specService,
        captureId
      );
      //@TODO: handle error
      //@TODO:getConfig for ignoreRequests config
      const events = eventStore.listEvents(rfcId);
      const config = await captureService.startDiff(
        ScalaJSHelpers.eventsJsArray(events),
        [],
        additionalCommands
      );
      const rfcState = rfcService.currentState(rfcId);

      const diffServiceForCapture = await diffServiceFactory(
        specService,
        captureService,
        rfcState,
        additionalCommands,
        config,
        captureId
      );
      setCaptureService(captureService);
      setDiffService(diffServiceForCapture);
    }
    task();
  }, [captureId, additionalCommands]);

  useEffect(() => {
    restart();
    return () => {};
  }, [diffService]);

  if (!diffService) {
    return <div>loading...</div>;
  }

  const updatedAdditionalCommands = (additionalCommands) => {
    setAdditionalCommands(additionalCommands);
  };

  const value = {
    diffService,
    captureService,
    restart,
    updatedAdditionalCommands,
    diffId,
    endpointDiffs,
    unrecognizedUrls,
    stats,
  };

  return (
    <CaptureContext.Provider value={value}>
      {props.children}
    </CaptureContext.Provider>
  );
}
