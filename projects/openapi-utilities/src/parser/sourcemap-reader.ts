import {
  DerefToSource,
  JsonPath,
  JsonSchemaSourcemap,
} from "./openapi-sourcemap-parser";
import fs from "fs-extra";
import { Kind, YamlMap, YAMLNode, YAMLSequence } from "yaml-ast-parser";

export function sourcemapReader(sourcemap: JsonSchemaSourcemap) {
  const findFile = (jsonPathFromRoot: JsonPath): ILookupPathResult => {
    const result: DerefToSource | undefined =
      sourcemap.mappings[jsonPathFromRoot];
    if (result) {
      const [source, file] = result;
      return {
        filePath: sourcemap.files.find((i) => i.index === file)!.path,
      };
    }
  };

  const findFileAndLines = async (jsonPathFromRoot: JsonPath) => {
    const filePath = findFile(jsonPathFromRoot);
    if (filePath) {
      const [astNode] = sourcemap.mappings[jsonPathFromRoot] as DerefToSource;
      const contents = (await fs.readFile(filePath.filePath)).toString();

      const [startPosition, endPosition] = astNodesToStartEndPosition(astNode);

      const { startLine, endLine, preview } = positionToLine(
        contents,
        startPosition,
        endPosition
      );
      const result: ILookupLinePreviewResult = {
        filePath: filePath.filePath,
        startLine,
        endLine,
        preview,
        startPosition: startPosition,
        endPosition: endPosition,
      };
      return result;
    }
  };

  return {
    findFile,
    findFileAndLines,
  };
}

type ILookupPathResult = undefined | { filePath: string };
export type ILookupLinePreviewResult =
  | undefined
  | {
      endLine: number;
      endPosition: number;
      filePath: string;
      startLine: number;
      preview: string;
      startPosition: number;
    };

//////////////////////////////////////////////////////////

function positionToLine(
  contents: string,
  start: number,
  end: number
): { startLine: number; endLine: number; preview: string } {
  const startLine =
    (contents.substring(0, start).match(/\n/g) || "").length + 1;
  const endLine =
    (contents.substring(end).match(/\n/g) || "").length + startLine - 1;

  const lines = contents.split(/\r\n|\r|\n/);

  const preview = lines.slice(startLine - 1, endLine).join("\n");

  return {
    startLine,
    endLine,
    preview,
  };
}

function astNodesToStartEndPosition(astNode: YAMLNode): [number, number] {
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
}
