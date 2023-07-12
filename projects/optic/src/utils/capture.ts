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
