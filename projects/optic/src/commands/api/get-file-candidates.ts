import fs from 'node:fs/promises';
import path from 'path';

export async function getFileCandidates(opts: {
  startsWith: string;
}): Promise<string[]> {
  const files: string[] = [];
  const stack: string[] = [process.cwd()];
  while (stack.length > 0) {
    const dir: string = stack.pop()!;
    for (const file of await fs.readdir(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, file.name);
      if (!absolutePath.startsWith(opts.startsWith)) {
        continue;
      }

      if (file.isDirectory()) {
        stack.push(absolutePath);
      } else if (/\.(json|ya?ml)$/i.test(file.name)) {
        files.push(absolutePath);
      }
    }
  }

  return files;
}
