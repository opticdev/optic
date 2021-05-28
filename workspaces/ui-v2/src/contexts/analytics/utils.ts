import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_CLIENT_AGENT_KEY = 'USER_CLIENT_AGENT';

export const getOrSetAgentFromLocalStorage = (defaultValue: string) => {
  try {
    const clientAgent = window.localStorage.getItem(
      LOCAL_STORAGE_CLIENT_AGENT_KEY
    );
    if (clientAgent) {
      return clientAgent;
    } else {
      const generatedClientAgent = `anonymous_user_${uuidv4()}`;
      window.localStorage.setItem(
        LOCAL_STORAGE_CLIENT_AGENT_KEY,
        generatedClientAgent
      );
      return generatedClientAgent;
    }
  } catch (e) {
    // SecurityError can be thrown if permissions are blocked
    return defaultValue;
  }
};
