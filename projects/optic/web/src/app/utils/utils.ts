import { anyChangelog } from './all-items';
import type { InternalSpecSchema } from './types';
import type { Changelog } from './changelog-tree';
import { od } from './changelog-tree';

export const ojp = Symbol.for('original_json_path');

export function getParameterKey(name: string, type: string): string {
  return `${type}: ${name}`;
}

export function splitParameterKey(key: string): { name: string; type: string } {
  const [type, name] = key.split(': ');
  return { type, name };
}

export function getPolymorphicKeyChangelog(
  schema: InternalSpecSchema
): Changelog<string> | undefined {
  // Check for nonpolymorphic -> polymorphic
  const changelog = anyChangelog(schema[od], 'polymorphicKey');
  if (changelog?.type === 'changed') {
    return {
      type: 'changed',
      before:
        changelog.before === null
          ? schema[od]?.removed?.type?.before === 'primitive'
            ? schema[od]?.removed?.value?.before
            : schema[od]?.removed?.type?.before
          : changelog.before,
    };
  } else if (changelog?.type === 'removed' && schema.polymorphicKey === null) {
    return {
      type: 'changed',
      before: schema.type === 'primitive' ? schema.value : schema.type,
    };
  }

  return undefined;
}
