import {
  JsonPath,
  JsonSchemaSourcemap,
  resolveJsonPointerInYamlAst,
  ToSource,
} from './openapi-sourcemap-parser';
import { Kind, YamlMap, YAMLNode, YAMLSequence } from 'yaml-ast-parser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  LookupLineResultWithFilepath,
  LookupLineResult,
} from '@useoptic/openapi-utilities';

export type ILookupPathResult = {
  filePath: string;
  startsAt: JsonPath;
  contents: string;
  astNode: YAMLNode;
};
export type ILookupFileResult = { filePath: string; startsAt: JsonPath };

export function sourcemapReader(sourcemap: JsonSchemaSourcemap) {
  const rootFileNumber = sourcemap.files.find(
    (i) => i.path === sourcemap.rootFilePath
  )!.index;

  const findFile = (
    jsonPathFromRoot: JsonPath
  ): ILookupPathResult | undefined => {
    const fileResult = findFilePosition(jsonPathFromRoot);
    if (!fileResult) return undefined;

    const file = sourcemap.files.find((i) => i.path === fileResult.filePath)!;

    const node = resolveJsonPointerInYamlAst(file.ast, fileResult.startsAt);

    if (node)
      return {
        filePath: file.path,
        astNode: node,
        contents: file.contents,
        startsAt: fileResult.startsAt,
      };
  };

  const findFilePosition = (jsonPathFromRoot: JsonPath): ILookupFileResult => {
    const decoded = jsonPointerHelpers.decode(jsonPathFromRoot);

    let cursor: {
      currentFile: number;
      pathInRoot: string[];
      pathInCurrentFile: string[];
    } = {
      currentFile: rootFileNumber,
      pathInRoot: [],
      pathInCurrentFile: [],
    };

    decoded.forEach((component, index) => {
      const path = jsonPointerHelpers.compile([
        ...cursor.pathInCurrentFile,
        component,
      ]);

      cursor.pathInRoot.push(component);
      const hitRef = sourcemap.refMappings[path] as ToSource | undefined;

      // console.log(path, hitRef ? "GOT HIT" : "no HIT");

      if (hitRef) {
        const [file, startingPath] = hitRef;
        cursor.currentFile = file;
        cursor.pathInCurrentFile = jsonPointerHelpers.decode(startingPath);
      } else {
        cursor.pathInCurrentFile.push(component);
      }

      // console.log(cursor);
    });

    const file = sourcemap.files.find((i) => i.index === cursor.currentFile)!;

    const cursorPath =
      cursor.pathInCurrentFile[0] === ''
        ? cursor.pathInCurrentFile.slice(1)
        : cursor.pathInCurrentFile;
    const pathInFile = jsonPointerHelpers.compile(cursorPath);

    return {
      filePath: file.path,
      startsAt: pathInFile,
    };
  };

  const findFileAndLines = async (jsonPathFromRoot: JsonPath) => {
    const lookupResult = findFile(jsonPathFromRoot);
    if (lookupResult) {
      const astNode = lookupResult.astNode;
      const contents = lookupResult.contents;

      const [startPosition, endPosition] = astNodesToStartEndPosition(astNode);

      const { startLine, endLine } = positionToLine(
        contents,
        startPosition,
        endPosition
      );
      const result: LookupLineResultWithFilepath = {
        filePath: lookupResult.filePath,
        startLine,
        endLine,
        startPosition: startPosition,
        endPosition: endPosition,
      };
      return result;
    }
  };

  const findLinesForAstAndContents = (astNode: YAMLNode, contents: string) => {
    const [startPosition, endPosition] = astNodesToStartEndPosition(astNode);

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
  };

  return {
    findFile,
    findFilePosition,
    findFileAndLines,
    findLinesForAstAndContents,
  };
}

//////////////////////////////////////////////////////////

function positionToLine(
  contents: string,
  start: number,
  end: number
): { startLine: number; endLine: number; preview: string } {
  const startLine =
    (contents.substring(0, start).match(/\n/g) || '').length + 1;
  const endLine =
    (contents.substring(start, end).match(/\n/g) || '').length + startLine;

  const lines = contents.split(/\r\n|\r|\n/);

  const preview = lines.slice(startLine - 1, endLine).join('\n');

  return {
    startLine,
    endLine,
    preview,
  };
}

function astNodesToStartEndPosition(astNode: YAMLNode): [number, number] {
  try {
    switch (astNode.kind) {
      case Kind.MAP: {
        const map = astNode as YamlMap;
        const end =
          map.value.mappings[map.value.mappings.length - 1]?.endPosition ||
          astNode.endPosition;
        return [map.startPosition, end];
      }
      case Kind.SEQ: {
        const seq = astNode as YAMLSequence;
        const end =
          seq.items[seq.items.length - 1]?.endPosition || astNode.endPosition;
        return [seq.startPosition, end];
      }
      default:
        return [astNode.startPosition, astNode.endPosition];
    }
  } catch {
    return [astNode.startPosition, astNode.endPosition];
  }
}
