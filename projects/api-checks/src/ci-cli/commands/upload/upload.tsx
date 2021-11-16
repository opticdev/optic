import path from "path";
import fs from "fs";

import { Command } from "commander";

export const registerUpload = (
  cli: Command,
  { opticToken }: { opticToken?: string }
) => {
  cli
    .command("upload")
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
          console.log("Loading files...");
          const [githubContextFileBuffer, ...fileBuffers] = await Promise.all([
            loadFile(context),
            loadFile(from),
            loadFile(to),
          ]);

          // TODO change this for different providers
          const { organization, pull_request, run } =
            readAndValidateGithubContext(githubContextFileBuffer);

          console.log("Uploading OpenAPI files to Optic...");

          const [githubContextFileS3Path, fromFileS3Path, toFileS3Path] =
            await Promise.all(
              fileBuffers.map((fileBuffer) =>
                uploadFileToS3(opticClient, fileBuffer)
              )
            );

          // TODO check whether the `run` numbers are reused, and if they are, should that overwrite, or create
          // i.e. there are run number, and run attempt, so retrying on the same commit hash may trigger the same run number
          // May need to try catch this block (or decide on product behavior)
          await opticClient.saveCiRun();

          console.log("Successfully uploaded files to Optic");
          const opticUploadUrl = "todo add url";
          console.log(
            `You can view the results of this run at: ${opticUploadUrl}`
          );
          // TODO post comment to github
        } catch (e) {
          console.error(e);
          return process.exit(1);
        }
      }
    );
};

type UploadContext = {
  organization: string;
  pull_request: number;
  run: number;
};

// This is specifically from the GITHUB_CONTEXT object
const readAndValidateGithubContext = (
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

// TODO created shared instance to import from (optic cloud fe + here)
// TODO figure out what the parameters we need are
class OpticBackendClient {
  constructor(
    private baseUrl: string,
    private getAuthToken: () => Promise<string>
  ) {}

  private fetch: typeof fetch = async (requestUri, options = {}) => {
    const token = await this.getAuthToken();
    const headers = options.headers || {};

    return fetch(`${this.baseUrl}${requestUri}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  public async getUploadUrl(): Promise<string> {
    return "";
  }

  public async saveCiRun() {}
}

const loadFile = (filePath: string): Promise<Buffer> => {
  const workingDir = process.cwd();
  const resolvedPath = path.resolve(workingDir, filePath);
  return new Promise((resolve, reject) => {
    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const uploadFileToS3 = async (
  opticClient: OpticBackendClient,
  file: Buffer
) => {
  const uploadUrl = await opticClient.getUploadUrl();
  await (async (uploadUrl: string, file: Buffer) => {
    // TODO upload this file to s3 via aws sdk?
  })(uploadUrl, file);
  return "TODO get location of uploaded file";
};
