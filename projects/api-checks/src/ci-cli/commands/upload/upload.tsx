import path from "path";
import fs from "fs";

import { Command } from "commander";

export const registerUpload = (cli: Command) => {
  cli
    .command("upload")
    .requiredOption("--from <from>", "from file or rev:file")
    .requiredOption("--to <to>", "from file or rev:file")
    // .requiredOption("--rules <rules>", "path to rules output") // TODO - uncomment and implement - also figure out how to make this
    // TODO figure out what optic domain routing information to send (organization, PR, runs)
    // TODO figure out what github context to send
    .action(async ({ from, to }: { from: string; to: string }) => {
      const backendWebBase =
        process.env.OPTIC_ENV === "staging"
          ? "https://api.o3c.info"
          : "https://api.useoptic.com";

      // TODO add token - maybe this is part of the make CLI config?
      const opticClient = new OpticBackendClient(
        backendWebBase,
        async () => ""
      );
      console.log("Loading files...");
      try {
        const fileBuffers = await Promise.all([loadFile(from), loadFile(to)]);

        console.log("Uploading OpenAPI files to Optic...");

        const [fromFileS3Path, toFileS3Path] = await Promise.all(
          fileBuffers.map((fileBuffer) =>
            uploadFileToS3(opticClient, fileBuffer)
          )
        );

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
    });
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
