import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export enum SpecVersionFrom {
  file,
  git,
  empty,
}

interface FromGit {
  from: SpecVersionFrom.git;
  branch: string;
  name: string;
}

interface FromFile {
  from: SpecVersionFrom.file;
  filePath: string;
}

interface FromEmpty {
  from: SpecVersionFrom.empty;
  value: OpenAPIV3.Document;
}

export type SpecFromInput = FromFile | FromGit | FromEmpty;

export function parseSpecVersion(
  raw: string | undefined,
  defaultSpec: OpenAPIV3.Document
): SpecFromInput {
  if (raw) {
    if (raw.includes(':')) {
      const [rev, name] = raw.split(':');
      // if (!rev || !name) throw new Error("invalid git rev:name input " + raw);
      return {
        from: SpecVersionFrom.git,
        name: name.startsWith('/') ? name.substring(1) : name,
        branch: rev,
      };
    } else {
      return {
        from: SpecVersionFrom.file,
        filePath: raw,
      };
    }
  } else {
    return {
      from: SpecVersionFrom.empty,
      value: defaultSpec,
    };
  }
}
