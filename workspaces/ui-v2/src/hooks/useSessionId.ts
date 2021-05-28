import { createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ClientSessionContext = createContext(uuidv4());

export function useSessionId() {
  return useContext(ClientSessionContext);
}
