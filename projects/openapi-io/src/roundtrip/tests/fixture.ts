import path from 'path';
import { Operation } from 'fast-json-patch';
import { RoundtripProvider } from '../roundtrip-provider';

export async function jsonPatchFixture(
  name: string,
  operations: Operation[],
  provider: RoundtripProvider<any>
) {
  const filePath = path.resolve(path.join(__dirname, 'inputs', name));
  const result = await provider.applyPatches(filePath, operations);

  if (result.success) {
    expect(result.value).toEqual(JSON.parse(result.asString));
  }

  return result;
}
