import { debug } from 'debug';

interface Deprecation {
  tag: string;
  message: string;
}

const deprecations: { [name: string]: Deprecation } = {
  taskProxyField: {
    tag: 'DEP-0001',
    message: `task.proxy field has been deprecated in favor of task.targetUrl field.`,
  },
};
export default deprecations;

export const deprecationLogger = debug('optic-cli-config-deprecations');
export function warnDeprecation({ message, tag }: Deprecation) {
  return deprecationLogger(`${message} [${tag}]`);
}
