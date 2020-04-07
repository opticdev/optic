import React, { useContext, useEffect, useMemo, useState } from 'react';

const BaseUrlContext = React.createContext(null);
BaseUrlContext.displayName = 'BaseUrlContext';

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = BaseUrlContext;


export function useBaseUrl() {
  const context = useContext(BaseUrlContext);
  return context.path;
}
