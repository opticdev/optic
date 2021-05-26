import * as React from 'react';
import {useContext} from 'react';

const BaseUrlContext = React.createContext({url: ''});
BaseUrlContext.displayName = 'BaseUrlContext';

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = BaseUrlContext;


export function useBaseUrl() {
  const context = useContext(BaseUrlContext);
  return context.url;
}
