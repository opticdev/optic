import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

interface IteratorResult {
  pointer: string;
  value: any;
}

export function* jsonIterator(
  obj: any,
  path: string = jsonPointerHelpers.compile([])
): Iterable<IteratorResult> {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const newPath = jsonPointerHelpers.append(path, i.toString());
      yield* jsonIterator(obj[i], newPath);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newPath = jsonPointerHelpers.append(path, key);
        yield* jsonIterator(obj[key], newPath);
      }
    }
  }
  yield { pointer: path, value: obj };
}
