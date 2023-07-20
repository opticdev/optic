import path from 'path';

export type SpawnCommand = {
  cmd: string;
  args: string[];
};

export function commandSplitter(command: string): SpawnCommand {
  return {
    cmd: command.split(' ')[0],
    args: command.split(' ').slice(1),
  };
}

// returns the relative path between file and rootPath
export function resolveRelativePath(rootPath: string, file: string): string {
  return path.relative(rootPath, path.resolve(file));
}
