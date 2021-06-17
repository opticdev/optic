import { FC, useEffect } from 'react';

import { IOpticSpecRepository } from '@useoptic/spectacle/build';
import { useSpecRepository } from '<src>/contexts/SpecRepositoryContext';

declare global {
  interface Window {
    __GLOBAL_DIFF_DEBUG_FUNCTION__?: () => any;
    debugOptic?: () => void;
  }
}

const GLOBAL_DIFF_DEBUG_FUNCTION = '__GLOBAL_DIFF_DEBUG_FUNCTION__';

// In the future, we could directly dump the redux store
export const useGlobalDiffDebug = (fn: () => any) => {
  useEffect(() => {
    window[GLOBAL_DIFF_DEBUG_FUNCTION] = fn;
    return () => {
      delete window[GLOBAL_DIFF_DEBUG_FUNCTION];
    };
  }, [fn]);
};

const debugDump = (specService: IOpticSpecRepository) => {
  return async function () {
    const events = await specService.listEvents();
    const diffDebugFunction = window[GLOBAL_DIFF_DEBUG_FUNCTION];
    const diffState = diffDebugFunction ? diffDebugFunction() : false;
    const diffStateCleaned = JSON.parse(JSON.stringify(diffState));

    const output = JSON.stringify(
      {
        events,
        diffState: diffStateCleaned,
      },
      null,
      2
    );

    const blob = new Blob([output], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-optic-state-${Math.floor(Date.now() / 1000)}.json`;
    console.log(link);
    link.click();
  };
};

export const DebugOpticComponent: FC<{}> = () => {
  const { specRepo } = useSpecRepository();
  useEffect(() => {
    window.debugOptic = debugDump(specRepo);
  }, [specRepo]);
  return null;
};
