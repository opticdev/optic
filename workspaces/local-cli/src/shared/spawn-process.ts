import { spawn, SpawnOptions } from 'child_process';

export async function spawnProcess(
  command: string,
  env: any = {}
): Promise<boolean> {
  const taskOptions: SpawnOptions = {
    env: {
      ...process.env,
      ...env,
    },
    shell: true,
    cwd: process.cwd(),
    stdio: 'inherit',
  };

  const child = spawn(command, taskOptions);

  return await new Promise((resolve) => {
    child.on('exit', (code) => {
      resolve(code === 0);
    });
  });
}
