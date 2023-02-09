import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { findOpenApiSpecsCandidates } from '../../utils/git-utils';
import path from 'path';

const exec = promisify(callbackExec);

type Path = string;
type Sha = string;

export async function getShasCandidatesForPath(
  path: string,
  depth: string
): Promise<Map<Path, Sha[]>> {
  // This should return commits in reverse chronological order
  // first parent treats merge commits as a single depth (not including children in it)
  const command =
    depth === '0'
      ? `git rev-list HEAD --first-parent`
      : `git rev-list HEAD -n ${depth} --first-parent`;
  let hashes: string[];
  try {
    const commandResults = await exec(command).then(({ stdout }) =>
      stdout.trim()
    );
    hashes = commandResults.split('\n');
  } catch (e) {
    // Will fail in an empty git repository
    return new Map();
  }

  return new Map([[path, hashes]]);
}

export async function getPathCandidatesForSha(
  sha: string,
  opts: {
    startsWith: string;
  }
): Promise<Map<Path, Sha[]>> {
  const results = new Map();
  // Pull all spec candidates (i.e. specs that have openapi key and are yml/yaml/json)
  // This won't check version / validity of spec and will not look for swagger2 specs
  const relativePaths = await findOpenApiSpecsCandidates();

  for (const p of relativePaths) {
    if (!path.resolve(p).startsWith(opts.startsWith)) {
      continue;
    }

    results.set(p, [sha]);
  }

  return results;
}
