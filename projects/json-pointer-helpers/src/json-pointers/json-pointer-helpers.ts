import * as jsonPointer from 'json-pointer';

function append(pointer: string, ...property: string[]): string {
  const parsed = jsonPointer.parse(pointer.toString()) || [];
  return jsonPointer.compile([...parsed, ...property]);
}

function pop(pointer: string): string {
  const parsed = jsonPointer.parse(pointer.toString()) || [];
  parsed.pop();
  return jsonPointer.compile([...parsed]);
}

function splitParentChild(pointer: string): [string, string, string] {
  const parsed = jsonPointer.parse(pointer.toString()) || [];
  const key = parsed.pop();
  return [jsonPointer.compile([...parsed]), key || '', pointer];
}

function unescapeUriSafePointer(inputFromApiToolkit: string): string {
  return decodeURIComponent(inputFromApiToolkit);
}

function compile(input: string[]) {
  return jsonPointer.compile(input);
}

function decode(pointer: string): string[] {
  return jsonPointer.parse(pointer);
}

function relative(pointer: string, from: string) {
  const targetDecoded = decode(pointer);
  const fromDecoded = decode(from);

  if (fromDecoded.length > targetDecoded.length)
    throw new Error(`${pointer} can not be relative to ${from}`);

  const parent = targetDecoded.slice(0, fromDecoded.length);
  if (JSON.stringify(parent) !== JSON.stringify(fromDecoded))
    throw new Error(
      `${pointer} can not be relative to ${from} -- need same lineage`
    );

  return compile(targetDecoded.slice(fromDecoded.length));
}

function tryGet(
  input: any,
  pointer: string
): { match: true; value: any } | { match: false; error: string } {
  try {
    const value = jsonPointer.get(input, pointer);
    return { match: true, value };
  } catch (e: any) {
    return { match: false, error: e.message };
  }
}

function join(leading: string, trailing: string): string {
  return compile([...decode(leading), ...decode(trailing)]);
}

export default {
  append,
  pop,
  decode,
  join,
  splitParentChild,
  unescapeUriSafePointer,
  get: jsonPointer.get,
  tryGet,
  compile,
  relative,
};
