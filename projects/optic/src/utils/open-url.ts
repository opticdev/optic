import fs from 'node:fs/promises';
import open from 'open';
import os from 'os';
import path from 'path';

const tmpDirectory = os.tmpdir();

export const openUrl = async (url: string) => {
  try {
    await open(url, {
      wait: false,
    });
  } catch (e) {
    if (e instanceof Error && /ENAMETOOLONG/i.test(e.message)) {
      const tmpHtmlPath = path.join(tmpDirectory, 'optic', 'tmp-web.html');
      await fs.mkdir(path.dirname(tmpHtmlPath), { recursive: true });

      await fs.writeFile(
        tmpHtmlPath,
        `<!DOCTYPE html><html><body><script type="text/javascript">window.location.replace("${url}")</script></body></html>`
      );

      await open(tmpHtmlPath);
    } else {
      throw e;
    }
  }
};
