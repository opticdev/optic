import {
  Kind,
  YamlMap,
  YAMLMapping,
  YAMLNode,
  YAMLSequence,
} from 'yaml-ast-parser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function resolveJsonPointerInYamlAst(
  node: YAMLNode, // root ast
  pointer: string
): YAMLNode | undefined {
  const decoded = jsonPointerHelpers.decode(pointer);
  const isEmpty =
    decoded.length === 0 || (decoded.length === 1 && decoded[0] === '');

  if (isEmpty) return node;

  const found: YAMLNode | undefined = decoded.reduce((current, path) => {
    if (!current) return undefined;
    const node: YAMLNode = current.key ? current.value : current;
    const isNumericalKey =
      !isNaN(Number(path)) && (node as any).hasOwnProperty('items');

    if (isNumericalKey) {
      return (node as YAMLSequence).items[Number(path)];
    } else {
      const field = node.mappings.find(
        (i: YAMLMapping) => i.key.value === path
      );
      return field;
    }
  }, node as YAMLNode | undefined);

  return found;
}

export function findLinesForAstAndContents(
  astNode: YAMLNode,
  contents: string
) {
  const [startPosition, endPosition] = astNodesToStartEndPosition(
    astNode,
    contents
  );

  const { startLine, endLine } = positionToLine(
    contents,
    startPosition,
    endPosition
  );

  const result: ILookupLinePreviewResult = {
    filePath: '',
    startLine,
    endLine,
    startPosition: startPosition,
    endPosition: endPosition,
  };
  return result;
}

export type ILookupLinePreviewResult =
  | undefined
  | {
      endLine: number;
      endPosition: number;
      filePath: string;
      startLine: number;
      startPosition: number;
    };

function positionToLine(
  contents: string,
  start: number,
  end: number
): { startLine: number; endLine: number } {
  const startLine =
    (contents.substring(0, start).match(/\n/g) || '').length + 1;
  const endLine =
    (contents.substring(start, end).match(/\n/g) || '').length + startLine;

  return {
    startLine,
    endLine,
  };
}

function astNodesToStartEndPosition(
  astNode: YAMLNode,
  contents: string
): [number, number] {
  const startEnd: [number, number] = [
    astNode.startPosition,
    astNode.endPosition,
  ];

  // remove trailing space (ranges in Ast are not exclusive when yaml arrays are used).
  const preview = contents.substring(startEnd[0], startEnd[1]);
  const withTrimEnd = preview.trimEnd();
  if (withTrimEnd !== preview) {
    const endAdjustment = preview.length - withTrimEnd.length;
    return [astNode.startPosition, astNode.endPosition - endAdjustment];
  }

  return startEnd;
}
