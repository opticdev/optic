import { SpecPatch } from '../specs';
const objectHash = require('object-hash');

export function patchHash(specPatch: SpecPatch): string {
  return objectHash(specPatch, {
    excludeKeys,
  });
}

function excludeKeys(key) {
  return key === 'example' || key === 'instancePath';
}
