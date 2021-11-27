import path from 'path';
import { Operation } from 'fast-json-patch';
import { RoundtripProvider } from '../roundtrip-provider';
import { loadYaml } from '../../write';

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
export async function yamlPatchFixture(
  name: string,
  operations: Operation[],
  provider: RoundtripProvider<any>
) {
  const filePath = path.resolve(path.join(__dirname, 'inputs', name));
  const result = await provider.applyPatches(filePath, operations);

  if (result.success) {
    const yamlParsed = loadYaml(result.asString);
    // console.log(yamlParsed);
    expect(result.value).toEqual(yamlParsed);
  }

  return result;
}
