import React, { useState } from 'react';
import deepCopy from 'deepcopy';
export const GuidedFlowContext = React.createContext('GuidedFlow');

export const useGuidedFlow = (tocSteps, initialState, reducer, render) => {
  const [internalState, setInternalState] = useState({
    currentStep: 0,
    ...initialState,
  });

  const dispatch = (event) => {
    const newState = reducer(deepCopy(internalState), event);
    newState && setInternalState(newState);
  };

  return {
    tocSteps,
    dispatch,
    currentStep: internalState.currentStep,
    internalState,
    centerContent: (
      <GuidedFlowContext.Provider value={{ dispatch, state: internalState }}>
        {render(internalState, dispatch)}
      </GuidedFlowContext.Provider>
    ),
  };
};
