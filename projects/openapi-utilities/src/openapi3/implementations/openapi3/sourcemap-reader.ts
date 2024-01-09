import * as YAML from 'yaml-ast-parser';
import {
  Kind,
  YamlMap,
  YAMLNode,
  YAMLSequence,
  YAMLMapping,
} from 'yaml-ast-parser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  ILookupFileResult,
  ILookupPathResult,
  JsonPath,
  SerializedSourcemap,
  SourcemapLine,
  ToSource,
} from './types';
import isUrl from 'is-url';
import urljoin from 'url-join';
import chalk from 'chalk';
import path from 'path';

export function resolveJsonPointerInYamlAst(
  node: YAMLNode, // root ast
  pointer: string
): YAMLNode | undefined {
  const decoded = jsonPointerHelpers.decode(pointer);
  const isEmpty =
    decoded.length === 0 || (decoded.length === 1 && decoded[0] === '');

  if (isEmpty) return node;

  const found: YAMLNode | undefined = decoded.reduce(
    (current, path) => {
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
    },
    node as YAMLNode | undefined
  );

  return found;
}

export function sourcemapReader(sourcemap: SerializedSourcemap) {
  const filesToYamlNode: Record<string, YAMLNode> = sourcemap.files.reduce(
    (acc, file) => ({
      ...acc,
      [file.path]: YAML.safeLoad(file.contents),
    }),
    {}
  );
  const rootFileNumber = sourcemap.files.find(
    (i) => i.path === sourcemap.rootFilePath
  )!.index;

  const findFile = (
    jsonPathFromRoot: JsonPath
  ): ILookupPathResult | undefined => {
    const fileResult = findFilePosition(jsonPathFromRoot);
    if (!fileResult) return undefined;

    const file = sourcemap.files.find((i) => i.path === fileResult.filePath)!;

    const node = resolveJsonPointerInYamlAst(
      filesToYamlNode[file.path],
      fileResult.startsAt
    );

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

    decoded.forEach((component) => {
      const path = jsonPointerHelpers.compile([
        ...cursor.pathInCurrentFile,
        component,
      ]);

      cursor.pathInRoot.push(component);
      const hitRef = sourcemap.refMappings[path] as ToSource | undefined;

      if (hitRef) {
        const [file, startingPath] = hitRef;
        cursor.currentFile = file;
        cursor.pathInCurrentFile = jsonPointerHelpers.decode(startingPath);
      } else {
        cursor.pathInCurrentFile.push(component);
      }
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

  const findFileAndLines = (
    jsonPathFromRoot: JsonPath
  ): SourcemapLine | undefined => {
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
      const result = {
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
    const result = {
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

export type GetSourcemapOptions =
  | {
      ciProvider: 'github' | 'gitlab';
      remote: string;
      sha: string;
      root: string;
    }
  | {
      ciProvider?: undefined;
    };

export function getSourcemapLink(
  sourcemap: SourcemapLine,
  options: GetSourcemapOptions = {}
): string {
  if (isUrl(sourcemap.filePath)) {
    return `${chalk.underline(sourcemap.filePath)} line ${sourcemap.startLine}`;
  } else if (options.ciProvider) {
    const pathFromRoot = path.relative(options.root, sourcemap.filePath);
    return options.ciProvider === 'github'
      ? urljoin(
          options.remote,
          'tree',
          options.sha,
          `${pathFromRoot}#L${sourcemap.startLine}`
        )
      : urljoin(
          options.remote,
          '-/blob',
          options.sha,
          `${pathFromRoot}#L${sourcemap.startLine}`
        );
  } else {
    const relativePath = path.relative(process.cwd(), sourcemap.filePath);
    return chalk.underline(
      `${relativePath}:${sourcemap.startLine}:${sourcemap.startPosition}`
    );
  }
}
