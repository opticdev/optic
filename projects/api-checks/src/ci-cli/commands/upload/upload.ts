import { Command } from "commander";
import { readAndValidateGithubContext } from "./context-parsers";
import {
  OpticBackendClient,
  SessionType,
  UploadSlot,
  UploadUrl,
} from "./optic-client";
import { loadFile, uploadFileToS3 } from "./utils";

export const registerUpload = (
  cli: Command,
  { opticToken }: { opticToken?: string }
) => {
  cli
    .command("upload")
    // TODO allow upload without from file (as an initial step)
    .requiredOption("--from <from>", "from file or rev:file")
    .requiredOption("--to <to>", "to file or rev:file")
    .requiredOption("--context <context>", "file with github context")
    .requiredOption("--rules <rules>", "path to rules output")
    .action(
      async (runArgs: {
        from: string;
        to: string;
        context: string;
        rules: string;
      }) => {
        if (!opticToken) {
          console.error("Upload token was not included");
          return process.exit(1);
        }

        const backendWebBase =
          process.env.OPTIC_ENV === "staging"
            ? "https://api.o3c.info"
            : "https://api.useoptic.com";

        const opticClient = new OpticBackendClient(backendWebBase, () =>
          Promise.resolve(opticToken)
        );
        try {
          await uploadCiRun(opticClient, runArgs);
        } catch (e) {
          console.error(e);
          return process.exit(1);
        }
      }
    );
};

export const uploadCiRun = async (
  opticClient: OpticBackendClient,
  runArgs: {
    from: string;
    to: string;
    context: string;
    rules: string;
  }
) => {
  console.log("Loading files...");

  const [
    githubContextFileBuffer,
    fromFileS3Buffer,
    toFileS3Buffer,
    rulesFileS3Buffer,
  ] = await Promise.all([
    loadFile(runArgs.context),
    loadFile(runArgs.from),
    loadFile(runArgs.to),
    loadFile(runArgs.rules),
  ]);

  const fileMap: Record<UploadSlot, Buffer> = {
    [UploadSlot.CheckResults]: rulesFileS3Buffer,
    [UploadSlot.FromFile]: fromFileS3Buffer,
    [UploadSlot.ToFile]: toFileS3Buffer,
    [UploadSlot.GithubActionsEvent]: githubContextFileBuffer,
  };

  // TODO change this for different providers
  const { organization, pull_request, run, run_attempt, repo } =
    readAndValidateGithubContext(githubContextFileBuffer);

  const sessionId = await opticClient.startSession(SessionType.GithubActions, {
    run_args: runArgs,
    github_data: {
      organization,
      repo,
      pull_request,
      run,
      run_attempt,
    },
  });

  console.log("Uploading OpenAPI files to Optic...");

  const uploadUrls = await opticClient.getUploadUrls(sessionId);

  const uploadedFilePaths: {
    id: string;
    s3Path: string;
  }[] = await Promise.all(
    uploadUrls.map(async (uploadUrl) => {
      const file = fileMap[uploadUrl.slot];
      const s3Path = await uploadFileToS3(uploadUrl.url, file);
      return {
        id: uploadUrl.id,
        s3Path,
      };
    })
  );

  // TODO make requests to file endpoint marking upload as complete

  // TODO check whether the `run` numbers are reused, and if they are, should that overwrite, or create
  // i.e. there are run number, and run attempt, so retrying on the same commit hash may trigger the same run number
  // May need to try catch this block (or decide on product behavior)
  await opticClient.saveCiRun();

  console.log("Successfully uploaded files to Optic");
  const opticUploadUrl = "todo add url";
  console.log(`You can view the results of this run at: ${opticUploadUrl}`);
  // TODO post comment to github
};
