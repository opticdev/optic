import { isJson, isYaml, loadYaml, writeYaml } from '../../index';
import {
  ParseResult,
  PatchApplyResult,
  RoundtripProvider,
} from '../roundtrip-provider';
import jsonpatch, { Operation } from 'fast-json-patch';
import isUrl from 'is-url';
import invariant from 'ts-invariant';

export class StringifyPatchesAcrossFileSystem
  implements RoundtripProvider<undefined> {
  async applyPatches(
    filePath: string,
    fileContents: string,
    operations: Operation[]
  ): Promise<PatchApplyResult> {
    invariant(
      !isUrl(filePath),
      `Unable to patch one of your dependencies. It a URL and not writable ${filePath}`
    );

    const parsed = await this.parse(filePath, fileContents);

    invariant(
      parsed.success,
      `Patch not possible because ${filePath} could not be parsed.`
    );

    const newDocument = jsonpatch.applyPatch(parsed.value, operations)
      .newDocument;

    const updatedString = stringifyDocument(filePath, newDocument);

    return {
      success: true,
      filePath,
      asString: updatedString,
      value: newDocument,
    };
  }

  name = 'stringify';
  fileExtensions = ['.json', '.yaml', '.yml'];

  inferConfig(contents: string): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  async parse(filePath: string, fileContents: string): Promise<ParseResult> {
    if (isJson(filePath)) {
      return { success: true, value: JSON.parse(fileContents) };
    } else if (isYaml(filePath)) {
      return { success: true, value: loadYaml(fileContents) };
    } else {
      return {
        success: false,
        error: `${filePath} is not .json or .yaml file. Unsure how to parse and apply patches`,
      };
    }
  }
}

function stringifyDocument(filePath: string, document: any): string {
  if (isJson(filePath)) {
    return JSON.stringify(document, null, 2);
  } else if (isYaml(filePath)) {
    return writeYaml(document);
  } else {
    throw new Error(
      `${filePath} is not .json or .yaml file. Unsure how to serialize`
    );
  }
}
