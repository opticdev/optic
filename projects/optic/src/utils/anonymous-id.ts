import { machineId } from 'node-machine-id';
export const getAnonId = async (): Promise<string> => {
  try {
    const anonymousId = await machineId();
    return anonymousId;
  } catch (e) {
    return 'unknown-user';
  }
};
