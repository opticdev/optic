import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { dumpSpecServiceState } from '../../../utilities/dump-spec-service-state';
import { GenericContextFactory } from '../../../contexts/GenericContextFactory';
import {
  useServices,
  useSpecService,
} from '../../../contexts/SpecServiceContext';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';

const {
  Context: AllCapturesContext,
  withContext: withAllCapturesContext,
} = GenericContextFactory(null);
export { AllCapturesContext };

export function AllCapturesStore(props) {
  const baseUrl = useBaseUrl();
  const [captures, setCaptures] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const specService = useSpecService();
  const history = useHistory();

  function update() {
    const task = async () => {
      const listCapturesResponse = await specService.listCaptures();
      const { captures } = listCapturesResponse;
      setCaptures(captures);
    };
    task();
  }

  useEffect(() => {
    update();
  }, []);

  // useEffect(() => {
  //   window.addEventListener('focus', update);
  //
  //   function cleanup() {
  //     window.removeEventListener('focus', update);
  //   }
  //
  //   return cleanup;
  // }, []);

  useEffect(() => {
    global.opticDump = dumpSpecServiceState(specService);
    global.dumpEvents = async () => await specService.listEvents();
  }, []);

  function dismissCapture(captureId) {
    setDismissed([...dismissed, captureId]);
  }

  function switchToCapture(captureId) {
    history.push(`${baseUrl}/diffs/${captureId}`);
  }

  const context = {
    captures,
    dismissed,
    dismissCapture,
    switchToCapture,
  };
  return (
    <AllCapturesContext.Provider value={context}>
      {props.children}
    </AllCapturesContext.Provider>
  );
}
