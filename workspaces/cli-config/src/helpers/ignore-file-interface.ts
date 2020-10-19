import fs from 'fs-extra';
import path from 'path';
import { readApiConfig } from '../index';
import lockfile from 'proper-lockfile';

interface IIgnoreFileParsed {
  filePath: string;
  ruleLines: IIgnoreFileRuleLine[];
  rulesFromYamlDeprecated: string[];
  allRules: string[];
}

interface IIgnoreFileRuleLine {
  line: number;
  rule: string;
}

export class IgnoreFileHelper {
  constructor(private ignoreFilePath: string, private opticYamlPath: string) {}

  async getCurrentIgnoreRules(): Promise<IIgnoreFileParsed> {
    const ignoreFile = path.resolve(this.ignoreFilePath);
    await fs.ensureFile(ignoreFile);

    const contents = await safeRead(this.ignoreFilePath);
    const lines = splitLines(contents);

    const rules: IIgnoreFileRuleLine[] = [];
    lines.forEach((line, index) => {
      if (line.trim() !== '' && !line.trim().startsWith('#')) {
        rules.push({
          line: index,
          rule: line,
        });
      }
    });

    const rulesFromYamlDeprecated = await this.loadDeprecatedRules();
    return {
      filePath: path.resolve(ignoreFile),
      ruleLines: rules,
      rulesFromYamlDeprecated,
      allRules: [...rules.map((i) => i.rule), ...rulesFromYamlDeprecated],
    };
  }

  async loadDeprecatedRules(): Promise<string[]> {
    try {
      const config = await readApiConfig(this.opticYamlPath);
      const ignores = config.ignoreRequests || [];
      return ignores;
    } catch (e) {
      return [];
    }
  }

  async appendRule(rule: string): Promise<void> {
    const contents = await safeRead(this.ignoreFilePath);
    await safeWrite(this.ignoreFilePath, contents.trim() + '\n' + rule);
  }
}

async function safeRead(filePath: string): Promise<string> {
  await lockfile.lock(filePath, {
    retries: { retries: 10 },
  });

  const contents = (await fs.readFile(filePath)).toString();
  await lockfile.unlock(filePath);
  return contents;
}

async function safeWrite(filePath: string, contents: string): Promise<void> {
  await lockfile.lock(filePath, {
    retries: { retries: 10 },
  });

  await fs.writeFile(filePath, contents);
  await lockfile.unlock(filePath);
}

function splitLines(t: string): string[] {
  return t.split(/\r\n|\r|\n/);
}
