import { Command } from "commander";
import { readAndValidateGithubContext } from "./context-parsers";
import { OpticBackendClient } from "./optic-client";
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
    // .requiredOption("--rules <rules>", "path to rules output") // TODO - uncomment and implement - also figure out how to make this
    .action(
      async ({
        from,
        to,
        context,
      }: {
        from: string;
        to: string;
        context: string;
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
          await uploadCiRun(opticClient, { from, to, context });
        } catch (e) {
          console.error(e);
          return process.exit(1);
        }
      }
    );
};

export const uploadCiRun = async (
  opticClient: OpticBackendClient,
  filePaths: { from: string; to: string; context: string }
) => {
  console.log("Loading files...");
  const [githubContextFileBuffer, ...fileBuffers] = await Promise.all([
    loadFile(filePaths.context),
    loadFile(filePaths.from),
    loadFile(filePaths.to),
  ]);

  // TODO change this for different providers
  const { organization, pull_request, run } = readAndValidateGithubContext(
    githubContextFileBuffer
  );

  // TODO make request to start session in optic

  console.log("Uploading OpenAPI files to Optic...");

  // TODO use start session upload file urls instead of generating own links
  const [githubContextFileS3Path, fromFileS3Path, toFileS3Path] =
    await Promise.all(
      [githubContextFileBuffer, ...fileBuffers].map((fileBuffer) => uploadFileToS3(opticClient, fileBuffer))
    );

  // TODO check whether the `run` numbers are reused, and if they are, should that overwrite, or create
  // i.e. there are run number, and run attempt, so retrying on the same commit hash may trigger the same run number
  // May need to try catch this block (or decide on product behavior)
  await opticClient.saveCiRun();

  console.log("Successfully uploaded files to Optic");
  const opticUploadUrl = "todo add url";
  console.log(`You can view the results of this run at: ${opticUploadUrl}`);
  // TODO post comment to github
};
