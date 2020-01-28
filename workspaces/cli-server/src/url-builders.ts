import {ICliDaemonState} from './index';

export function makeUiBaseUrl(daemonState: ICliDaemonState) {
  if (process.env.OPTIC_UI_HOST) {
    return process.env.OPTIC_UI_HOST;
  }
  return `http://localhost:${daemonState.port}`;
}
