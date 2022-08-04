import {
  YAMLNode,
} from 'yaml-ast-parser';

export function findLinesForAstAndContents(
  astNode: YAMLNode,
  contents: string
): LookupLineResult {
  const [startPosition, endPosition] = astNodesToStartEndPosition(
    astNode,
    contents
  );

  const { startLine, endLine } = positionToLine(
    contents,
    startPosition,
    endPosition
  );

  const result: LookupLineResult = {
    startLine,
    endLine,
    startPosition: startPosition,
    endPosition: endPosition,
  };
  return result;
}

export type LookupLineResult = {
  endLine: number;
  endPosition: number;
  startLine: number;
  startPosition: number;
};

export type LookupLineResultWithFilepath = LookupLineResult & {
  filePath: string;
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
