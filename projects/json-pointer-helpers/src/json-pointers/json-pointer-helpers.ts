import JsonPointer from 'json-pointer';

const escape = (str: string) => str.replace(/~/g, '~0').replace(/\//g, '~1');

const unescape = (str: string) => str.replace(/~0/g, '~').replace(/~1/g, '/');

const parse = (pointer: string) => pointer.split('/').slice(1).map(unescape);

const compile = (parts: string[]) => '/' + parts.map(escape).join('/');

function append(pointer: string, ...property: string[]): string {
  const parsed = parse(pointer.toString());
  return compile([...parsed, ...property]);
}

function pop(pointer: string): string {
  const parsed = parse(pointer.toString());
  parsed.pop();
  return compile([...parsed]);
}

function splitParentChild(pointer: string): [string, string, string] {
  const parsed = parse(pointer.toString());
  const key = parsed.pop();
  return [compile([...parsed]), key || '', pointer];
}

function unescapeUriSafePointer(inputFromApiToolkit: string): string {
  return decodeURIComponent(inputFromApiToolkit);
}

function relative(pointer: string, from: string) {
  const targetDecoded = parse(pointer);
  const fromDecoded = parse(from);

  if (fromDecoded.length > targetDecoded.length)
    throw new Error(`${pointer} can not be relative to ${from}`);

  const parent = targetDecoded.slice(0, fromDecoded.length);
  if (JSON.stringify(parent) !== JSON.stringify(fromDecoded)) {
    throw new Error(
      `${pointer} can not be relative to ${from} -- need same lineage`
    );
  }
  return compile(targetDecoded.slice(fromDecoded.length));
}

function tryGet(
  input: any,
  pointer: string
): { match: true; value: any } | { match: false; error: string } {
  try {
    const value = JsonPointer.get(input, pointer);
    return { match: true, value };
  } catch (e: any) {
    return { match: false, error: e.message };
  }
}

function join(leading: string, trailing: string): string {
  return compile([...parse(leading), ...parse(trailing)]);
}

export default {
  append,
  pop,
  decode: parse,
  join,
  splitParentChild,
  unescapeUriSafePointer,
  get: JsonPointer.get,
  tryGet,
  compile,
  relative,
};
