import * as jsonPointer from "json-pointer";

function append(pointer: string, ...property: string[]): string {
  const parsed = jsonPointer.parse(pointer) || [];
  return jsonPointer.compile([...parsed, ...property]);
}

function unescapeUriSafePointer(inputFromApiToolkit: string): string {
  return decodeURIComponent(inputFromApiToolkit);
}

export default {
  append,
  unescapeUriSafePointer,
};
