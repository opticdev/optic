import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useServices } from './SpecServiceContext';

export const CaptureContext = React.createContext(null);

export function useCaptureContext() {
  const { diffServiceFactory } = useContext(CaptureContext);
  return {
    diffServiceFactory,
  };
}

export function CaptureStateStore(props) {
  const { captureId } = props;
  const [diffService, setDiffService] = useState(null);
  const {
    specService,
    captureServiceFactory,
    diffServiceFactory,
  } = useServices();
  function restart() {
    debugger;
  }
  useEffect(() => {
    const captureService = captureServiceFactory(specService, captureId);
    async function task() {
      //@TODO: handle error
      //@TODO:getConfig for ignoreRequests config
      debugger;
      const config = await captureService.startDiff();
      const diffServiceForCapture = diffServiceFactory(specService, config);
      setDiffService(diffServiceForCapture);
    }

    task();
  });

  if (!diffService) {
    return <div>loading...</div>;
  }

  const value = {
    diffService,
    restart,
  };

  return (
    <CaptureContext.Provider value={value}>
      {props.children}
    </CaptureContext.Provider>
  );
}
