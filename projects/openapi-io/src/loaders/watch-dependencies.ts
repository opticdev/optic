import fs from 'fs';
import { WatchEventType } from 'fs-extra';
import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';
import fsExtra from 'fs-extra';
import path from 'path';
import { JsonSchemaSourcemap } from '../parser/openapi-sourcemap-parser';

export type WatchDependenciesHandler = { stopWatching: () => void };

export function watchDependencies(
  sourcemap: JsonSchemaSourcemap,
  callback: (changedFilename: string) => void,
  oneTime: boolean = true
): WatchDependenciesHandler {
  const deps = sourcemap.files.map((i) => ({ path: i.path, sha256: i.sha256 }));

  let called = false;

  const onChangeEvent = async (watchType: WatchEventType, filename: string) => {
    const resolvedFileName = path.resolve(filename);
    const fileContents = (await fsExtra.readFile(filename)).toString();
    const sha = Hex.stringify(sha256(fileContents));
    if (
      (!called || !oneTime) &&
      sha !== deps.find((i) => i.path === resolvedFileName)?.sha256
    ) {
      callback(filename);
      called = true;
    }
  };

  const closeAll = deps.map((dep) => {
    const watching = fs.watch(dep.path, onChangeEvent);
    return () => watching.close();
  });

  return {
    stopWatching: () => {
      closeAll.map((i: () => void) => i());
    },
  };
}
