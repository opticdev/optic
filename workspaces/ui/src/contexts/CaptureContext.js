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
  const [additionalCommands, setAdditionalCommands] = useState([]);

  const { eventStore, rfcId } = useContext(RfcContext);

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
      diffService.listDiffs().then(setEndpointDiffs);
      diffService.listUnrecognizedUrls().then(setUnrecognizedUrls);
      setDiffId(diffService.diffId());
    }
  }
  useEffect(() => {
    const captureService = captureServiceFactory(specService, captureId);
    async function task() {
      //@TODO: handle error
      //@TODO:getConfig for ignoreRequests config
      const config = await captureService.startDiff(
        ScalaJSHelpers.eventsJsArray(eventStore.listEvents(rfcId)),
        [],
        setAdditionalCommands
      );
      const diffServiceForCapture = diffServiceFactory(
        specService,
        additionalCommands,
        config
      );
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
