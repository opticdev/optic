import keymirror from 'keymirror';

export const DocumentAPIFlowEvents = keymirror({
  MODE_SELECTED: null,
  FRAMEWORK_SELECTED: null,
  EMPTY_SEARCH_RESULTS: null,
  CHANGED_START_COMMAND: null,
  CHANGED_HOSTNAME: null,
  SET_STEP_TO: null,
  CHANGED_TARGET_URL: null,
  MARK_API_AS_INITIALIZED: null,
});

export function MODE_SELECTED(mode) {
  return { type: DocumentAPIFlowEvents.MODE_SELECTED, mode };
}
export function SET_STEP_TO(to) {
  return { type: DocumentAPIFlowEvents.SET_STEP_TO, to };
}
export function FRAMEWORK_SELECTED(framework) {
  return { type: DocumentAPIFlowEvents.FRAMEWORK_SELECTED, framework };
}
export function EMPTY_SEARCH_RESULTS() {
  return { type: DocumentAPIFlowEvents.EMPTY_SEARCH_RESULTS };
}

export function CHANGED_START_COMMAND(command) {
  return { type: DocumentAPIFlowEvents.CHANGED_START_COMMAND, command };
}

export function CHANGED_HOSTNAME(hostname) {
  return { type: DocumentAPIFlowEvents.CHANGED_HOSTNAME, hostname };
}
export function CHANGED_TARGET_URL(targetUrl) {
  return { type: DocumentAPIFlowEvents.CHANGED_TARGET_URL, targetUrl };
}

export function MARK_API_AS_INITIALIZED(cwd, name) {
  return { type: DocumentAPIFlowEvents.MARK_API_AS_INITIALIZED, name, cwd };
}

//constants
export const MODES = keymirror({
  RECOMMENDED: null,
  MANUAL: null,
});
