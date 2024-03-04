import path from 'path';
import { normalize } from 'crosspath';

export type SpawnCommand = {
  cmd: string;
  args: string[];
};

// commandSplitter() splits a command and its args into a SpawnCommand--in a naive fashion. it
// assumes that `command` contains a single command, rather than something more complex. since
// there is no validation or safety checks performed on `command` exercise caution where you
// use this.
export function commandSplitter(command: string): SpawnCommand {
  return {
    cmd: command.split(' ')[0],
    args: command.split(' ').slice(1),
  };
}

// returns the relative path between file and rootPath
export function resolveRelativePath(rootPath: string, file: string): string {
  return normalize(path.relative(rootPath, path.resolve(file)));
}
