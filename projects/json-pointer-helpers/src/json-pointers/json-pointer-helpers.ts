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

function unescapeUriSafePointer(inputFromApiToolkit: string): string {
  return decodeURIComponent(inputFromApiToolkit);
}

function compile(input: string[]) {
  return jsonPointer.compile(input);
}

function decode(pointer: string): string[] {
  return jsonPointer.parse(pointer);
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

export default {
  append,
  pop,
  decode,
  unescapeUriSafePointer,
  get: jsonPointer.get,
  tryGet,
  compile,
};
