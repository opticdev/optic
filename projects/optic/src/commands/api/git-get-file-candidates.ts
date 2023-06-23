import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { findOpenApiSpecsCandidates } from '../../utils/git-utils';
import path from 'path';

const exec = promisify(callbackExec);

type Candidates = { shas: string[]; paths: string[] };

export async function getShasCandidatesForPath(
  path: string,
  depth: string
): Promise<Candidates> {
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
    return { shas: [], paths: [] };
  }

  return { shas: hashes, paths: [path] };
}

export async function followFile(path: string, depth: string = '0') {
  const depthChunk = depth === '0' ? '' : ` -n ${Number(depth) + 1}`;
  const command = `git log${depthChunk} --follow --name-only --pretty=format:"%H" ${path}`;
  try {
    const commandResults = await exec(command).then(({ stdout }) =>
      stdout.trim()
    );
    const entries = commandResults
      .split('\n\n')
      .map((group) => group.split('\n'));
    return entries;
  } catch (err) {
    return [];
  }
}

export async function getPathCandidatesForSha(
  sha: string,
  opts: {
    startsWith: string;
    depth: string;
  }
): Promise<Candidates> {
  let hashes: string[] = [sha];
  if (opts.depth !== '1') {
    const command =
      opts.depth === '0'
        ? `git rev-list HEAD --first-parent`
        : `git rev-list HEAD -n ${opts.depth} --first-parent`;
    try {
      const commandResults = await exec(command).then(({ stdout }) =>
        stdout.trim()
      );
      hashes = commandResults.split('\n');
    } catch (e) {
      // Will fail in an empty git repository
    }
  }

  const paths: string[] = [];
  // Pull all spec candidates (i.e. specs that have openapi key and are yml/yaml/json)
  // This won't check version / validity of spec and will not look for swagger2 specs
  const relativePaths = await findOpenApiSpecsCandidates();

  for (const p of relativePaths) {
    if (!path.resolve(p).startsWith(opts.startsWith)) {
      continue;
    }

    paths.push(p);
  }

  return { shas: hashes, paths };
}
