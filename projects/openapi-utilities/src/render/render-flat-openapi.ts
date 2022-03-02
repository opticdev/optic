import { OpenAPIV3 } from 'openapi-types';
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import * as YAML from 'yaml-ast-parser';
import { YAMLNode } from 'yaml-ast-parser';
import {
  findLinesForAstAndContents,
  LookupLineResult,
  resolveJsonPointerInYamlAst,
} from './ast-helpers';
import { jsonPointerHelpers } from '../../../json-pointer-helpers';

export type RenderFlatOpenAPI = {
  openapi: OpenAPIV3.Document;
  asYamlString: string;
  offsetsForAbsolutePath: (jsonPointer: string) => LookupLineResult | undefined;
};

export function renderFlatOpenAPI(
  openapi: OpenAPIV3.Document
): RenderFlatOpenAPI {
  const asYamlString = yamlDump(openapi, { indent: 2 });
  const yamlAst: YAMLNode = YAML.safeLoad(asYamlString);

  return {
    openapi,
    asYamlString,
    offsetsForAbsolutePath: (
      jsonPointer: string
    ): LookupLineResult | undefined => {
      const astNode = resolveJsonPointerInYamlAst(yamlAst, jsonPointer);
      if (astNode) {
        return findLinesForAstAndContents(astNode, asYamlString);
      }
    },
  };
}

export type RenderFlatJsonSchema<T = any> = {
  asYamlString: string;
  data: T;
  startingPath: string;
  // just make sure these paths are relative to the schema object
  offsetsForAbsolutePath: (jsonPointer: string) => LookupLineResult | undefined;
  offsetsForRelativePath: (jsonPointer: string) => LookupLineResult | undefined;
};

export function renderFlatJsonSchema<T = any>(
  data: T,
  startingPath: string
): RenderFlatJsonSchema<T> {
  const asYamlString = yamlDump(data, { indent: 2 });
  const yamlAst: YAMLNode = YAML.safeLoad(asYamlString);
  return {
    data,
    startingPath,
    asYamlString,
    // assumed relative
    offsetsForAbsolutePath: (
      jsonPointer: string
    ): LookupLineResult | undefined => {
      const pointer = jsonPointerHelpers.relative(jsonPointer, startingPath);
      const astNode = resolveJsonPointerInYamlAst(yamlAst, pointer);
      if (astNode) {
        return findLinesForAstAndContents(astNode, asYamlString);
      }
    },
    offsetsForRelativePath: (
      jsonPointer: string
    ): LookupLineResult | undefined => {
      const astNode = resolveJsonPointerInYamlAst(yamlAst, jsonPointer);
      if (astNode) {
        return findLinesForAstAndContents(astNode, asYamlString);
      }
    },
  };
}
