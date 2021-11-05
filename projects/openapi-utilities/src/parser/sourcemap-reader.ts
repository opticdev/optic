import {
  DerefToSource,
  JsonPath,
  JsonSchemaSourcemap,
} from "./openapi-sourcemap-parser";

export function sourcemapReader(sourcemap: JsonSchemaSourcemap) {
  return {
    findPath: (jsonPath: JsonPath): ILookupPathResult => {
      const result: DerefToSource | undefined = sourcemap.mappings[jsonPath];
      if (result) {
        const [source, file] = result;
        return {
          filePath: sourcemap.files.find((i) => i.index === file)!.path,
        };
      }
    },
  };
}

type ILookupPathResult = undefined | { filePath: string };
