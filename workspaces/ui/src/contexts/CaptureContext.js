import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useServices } from './SpecServiceContext';

export const CaptureContext = React.createContext(null);

export function useCaptureContext() {
  return useContext(CaptureContext);
}

export function CaptureStateStore(props) {
  const { captureId } = props;
  const [diffService, setDiffService] = useState(null);

  // diff state
  const [endpointDiffs, setEndpointDiffs] = useState([]);
  const [unrecognizedUrls, setUnrecognizedUrls] = useState([]);
  const [stats, setStats] = useState({});

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
    }
  }
  useEffect(() => {
    const captureService = captureServiceFactory(specService, captureId);
    async function task() {
      //@TODO: handle error
      //@TODO:getConfig for ignoreRequests config
      const config = await captureService.startDiff();
      const diffServiceForCapture = diffServiceFactory(specService, config);
      setDiffService(diffServiceForCapture);
    }
    task();
  }, [captureId]);

  useEffect(() => {
    restart();
    return () => {};
  }, [diffService]);

  if (!diffService) {
    return <div>loading...</div>;
  }

  const value = {
    diffService,
    restart,
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
