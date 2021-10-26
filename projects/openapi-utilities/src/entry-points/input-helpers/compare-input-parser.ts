import tap from "tap";
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

tap.test("can parse a file ", async () => {
  tap.matchSnapshot(parseSpecVersion("/path/to/spec.json"), "file");
});

tap.test("can parse a git rev-file ", async () => {
  tap.matchSnapshot(parseSpecVersion("main:/path/to/spec.json"), "rev-main");
  tap.matchSnapshot(
    parseSpecVersion("feature/1:spec.json"),
    "rev with / in it"
  );
  tap.matchSnapshot(
    parseSpecVersion("feature/1/define-spc:path/to/spec.json"),
    "file without leading slash"
  );
});
