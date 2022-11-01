import fetch from 'node-fetch';
import zlib from 'node:zlib';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function downloadRuleset(
  name: string,
  url: string
): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(
      `Downloading ruleset failed (${resp.status}): ${await resp.text()}`
    );
  }

  const compressed = await resp.buffer();
  const decompressed = await zlib.brotliDecompressSync(compressed);

  const filepath = path.join(os.tmpdir(), `${name}.js`);
  const filefolder = path.dirname(filepath);
  // Does not error if folder exists when recursive = true
  await fs.mkdir(filefolder, { recursive: true });
  // TODO handle caching for local instance
  await fs.writeFile(filepath, decompressed);

  return filepath;
}
