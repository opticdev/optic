import fs from 'node:fs/promises';
import path from 'path';

export async function getFileCandidates(opts: {
  root?: string;
  startsWith?: string;
}): Promise<string[]> {
  const root = opts.root || process.cwd();
  const files: string[] = [];
  const stack: string[] = [root];
  while (stack.length > 0) {
    const dir: string = stack.pop()!;
    for (const file of await fs.readdir(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, file.name);
      if (opts.startsWith && !absolutePath.startsWith(opts.startsWith)) {
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
