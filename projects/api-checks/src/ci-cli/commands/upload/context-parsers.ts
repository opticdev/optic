type UploadContext = {
  organization: string;
  pull_request: number;
  run: number;
};

// This is specifically from the GITHUB_CONTEXT object
export const readAndValidateGithubContext = (
  unvalidatedContextFile: Buffer
): UploadContext => {
  // expected shape should is from `echo $GITHUB_CONTEXT > file`
  // full event payload https://github.com/octokit/webhooks/blob/master/payload-types/schema.d.ts#L248
  const parsedContext = JSON.parse(unvalidatedContextFile.toString());

  if (parsedContext.event_name !== "pull_request") {
    throw new Error(
      "Upload expects to be triggered with a pull_request github workflow action"
    );
  }

  const organization: string | undefined =
    parsedContext.event?.repository?.owner?.login;
  const pull_request: number | undefined =
    parsedContext.event?.pull_request?.number;
  const run: number | undefined = parsedContext.run_number;

  if (!organization) {
    throw new Error(
      "Expected a respository owner at context.event.repository.owner.login"
    );
  }

  if (!pull_request) {
    throw new Error(
      "Expected a pull_request number at context.event.pull_request.number"
    );
  }

  if (!run) {
    throw new Error("Expected a run_number at context.run_number");
  }

  return {
    organization,
    pull_request,
    run,
  };
};
