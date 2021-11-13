import {
  DerefToSource,
  JsonPath,
  JsonSchemaSourcemap,
  resolveJsonPointerInYamlAst,
  ToSource,
} from "./openapi-sourcemap-parser";
import fs from "fs-extra";
import { Kind, YamlMap, YAMLNode, YAMLSequence } from "yaml-ast-parser";
import { jsonPointerHelper } from "../index";
import equals from "fast-deep-equal";

export function sourcemapReader(sourcemap: JsonSchemaSourcemap) {
  const rootFileNumber = sourcemap.files.find(
    (i) => i.path === sourcemap.rootFilePath
  )!.index;

  const findFile = (
    jsonPathFromRoot: JsonPath,
    currentFile: number = rootFileNumber
  ): ILookupPathResult => {
    const decoded = jsonPointerHelper.decode(jsonPathFromRoot);

    // console.log("running it", jsonPathFromRoot, currentFile);

    let consideredRefs = sourcemap.refMappings;

    let pathStartLookup: ToSource | undefined;

    decoded.forEach((component, index) => {
      const filtered = consideredRefs.filter((trailMappings) => {
        const [flatTrail] = trailMappings;
        const atLength = flatTrail.slice(0, index + 1);
        return equals(atLength, decoded.slice(0, index + 1));
      });
      if (consideredRefs.length > 0 && filtered.length === 0) {
        pathStartLookup = consideredRefs[0];
      }
      consideredRefs = filtered;
    });

    // console.log(pathStartLookup);

    if (pathStartLookup) {
      const [pathInRoot, fileN, jsonPathInFile] = pathStartLookup;
      const pointerFull = jsonPointerHelper.compile([
        ...jsonPathInFile,
        ...decoded.slice(pathInRoot.length),
      ]);

      const fileLookup = sourcemap.files.find((i) => i.index === fileN)!;

      if (fileLookup.index === currentFile) {
        return findFile(pointerFull, currentFile);
      }

      const node = resolveJsonPointerInYamlAst(fileLookup.ast, pointerFull);

      if (node) {
        return {
          filePath: fileLookup.path,
          astNode: node,
          startsAt: jsonPointerHelper.compile(jsonPathInFile),
        };
      }
    } else {
      // assume root file
      const fileLookup = sourcemap.files.find((i) => i.index === currentFile);
      if (fileLookup) {
        const node = resolveJsonPointerInYamlAst(
          fileLookup.ast,
          jsonPathFromRoot
        );
        if (node) {
          return {
            filePath: fileLookup.path,
            astNode: node,
            startsAt: jsonPathFromRoot,
          };
        }
      }
    }
  };

  const findFileAndLines = async (jsonPathFromRoot: JsonPath) => {
    const lookupResult = findFile(jsonPathFromRoot);
    if (lookupResult) {
      const astNode = lookupResult.astNode;
      const contents = (await fs.readFile(lookupResult.filePath)).toString();

      const [startPosition, endPosition] = astNodesToStartEndPosition(astNode);

      const { startLine, endLine, preview } = positionToLine(
        contents,
        startPosition,
        endPosition
      );
      const result: ILookupLinePreviewResult = {
        filePath: lookupResult.filePath,
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

type ILookupPathResult =
  | undefined
  | { filePath: string; startsAt: JsonPath; astNode: YAMLNode };
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
