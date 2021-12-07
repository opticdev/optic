type UploadContext = {
  organization: string;
  repo: string;
  commit_hash: string;
  pull_request: number;
  run: number;
};

// This is specifically from the GITHUB_CONTEXT object
export const readAndValidateGithubContext = (
  unvalidatedContextFile: Buffer
): UploadContext => {
  // expected shape should is from `echo $GITHUB_CONTEXT > file`
  // full event payload
  const parsedContext = JSON.parse(unvalidatedContextFile.toString());

  if (parsedContext.event_name !== 'pull_request') {
    throw new Error(
      'Upload expects to be triggered with a pull_request github workflow action'
    );
  }

  const organization: string | undefined =
    parsedContext.event?.repository?.owner?.login;
  const repo: string | undefined = parsedContext.event?.repository?.name;
  const pull_request: number | undefined =
    parsedContext.event?.pull_request?.number;
  const run: number | undefined = parsedContext.run_number;
  const commit_hash: string | undefined = parsedContext.sha;

  if (!organization) {
    throw new Error(
      'Expected a respository owner at context.event.repository.owner.login'
    );
  }

  if (!repo) {
    throw new Error('Expected a repo at context.event.repository.name');
  }

  if (!pull_request) {
    throw new Error(
      'Expected a pull_request number at context.event.pull_request.number'
    );
  }

  if (!run) {
    throw new Error('Expected a run_number at context.run_number');
  }

  if (!commit_hash) {
    throw new Error('Expected a sha at context.sha');
  }

  return {
    organization,
    repo,
    commit_hash: commit_hash,
    pull_request: Number(pull_request),
    run: Number(run),
  };
};

// This is from a jsonified circleci environment variables
export const readAndValidateCircleCiContext = (
  unvalidatedContextFile: Buffer
): UploadContext => {
  const parsedContext = JSON.parse(unvalidatedContextFile.toString());

  const repo_url: string | undefined = parsedContext.CIRCLE_REPOSITORY_URL;
  const pull_request: number | undefined = parsedContext.CIRCLE_PR_NUMBER;
  const run: number | undefined = parsedContext.CIRCLE_BUILD_NUM;
  const commit_hash: string | undefined = parsedContext.CIRCLE_SHA1;

  if (!repo_url) {
    throw new Error(
      'Expected a CIRCLE_REPOSITORY_URL number at context.CIRCLE_REPOSITORY_URL'
    );
  }

  if (!pull_request) {
    throw new Error(
      'Expected a CIRCLE_PR_NUMBER number at context.CIRCLE_PR_NUMBER'
    );
  }

  if (!run) {
    throw new Error('Expected a CIRCLE_BUILD_NUM at context.CIRCLE_BUILD_NUM');
  }

  if (!commit_hash) {
    throw new Error('Expected a CIRCLE_SHA1 at context.CIRCLE_SHA1');
  }

  // try parse org and repo from url
  // TODO there's a better way to do this for them to specify, but for now this should work
  const url = new URL(repo_url);
  const [, organization, repo] = url.pathname.split('/');
  if (!organization || !repo) {
    throw new Error(
      'Could not parse owner or repo from the circle repository url - expected a format of `git_domain/:owner/:repo`, got: ' +
        repo_url
    );
  }

  return {
    organization,
    repo,
    commit_hash: commit_hash,
    pull_request: Number(pull_request),
    run: Number(run),
  };
};
