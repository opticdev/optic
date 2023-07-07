import { isJson, isYaml, loadYaml, writeYaml } from '@useoptic/openapi-io';
import { PatchApplyResult, SpecFileReconciler } from '.';
import jsonpatch, { Operation } from 'fast-json-patch';
import isUrl from 'is-url';
import invariant from 'ts-invariant';
import { Result, Ok, Err } from 'ts-results';

export const applyPatch: SpecFileReconciler<Config> = async function applyPatch<
  Config,
>(
  filePath: string,
  fileContents: string,
  operations: Operation[]
): Promise<PatchApplyResult> {
  invariant(
    !isUrl(filePath),
    `Unable to patch one of your dependencies. It a URL and not writable ${filePath}`
  );

  const parsed = parse(filePath, fileContents);

  invariant(
    parsed.ok,
    `Patch not possible because ${filePath} could not be parsed: ${parsed.val}`
  );

  const newDocument = jsonpatch.applyPatch(
    parsed.val || {},
    operations
  ).newDocument;

  const updatedString = stringifyDocument(filePath, newDocument);

  return {
    success: true,
    filePath,
    contents: updatedString,
  };
};

export const fileExtensions = ['.json', '.yaml', '.yml'];

export type name = 'stringify';
export type Config = undefined;

function parse(filePath: string, fileContents: string): Result<any, string> {
  if (isJson(filePath)) {
    return Ok((fileContents && JSON.parse(fileContents)) || {});
  } else if (isYaml(filePath)) {
    return Ok(loadYaml(fileContents));
  } else {
    return Err(
      `${filePath} is not .json or .yaml file. Unsure how to parse and apply patches`
    );
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
