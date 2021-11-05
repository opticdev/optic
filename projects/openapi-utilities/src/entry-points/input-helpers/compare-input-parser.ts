import path from "path";
import { inGit, loadSpecFromBranch } from "../../loaders/file-on-branch";

enum SpecVersionFrom {
  file,
  git,
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

export function parseSpecVersion(raw: string): FromFile | FromGit {
  if (raw.includes(":")) {
    const [rev, name] = raw.split(":");
    // if (!rev || !name) throw new Error("invalid git rev:name input " + raw);
    return {
      from: SpecVersionFrom.git,
      name: name.startsWith("/") ? name.substring(1) : name,
      branch: rev,
    };
  } else {
    return {
      from: SpecVersionFrom.file,
      filePath: raw,
    };
  }
}
