import path from "path";
import fs from "fs";

import { OpticBackendClient } from "./optic-client";

export const loadFile = (filePath: string): Promise<Buffer> => {
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

export const uploadFileToS3 = async (
  opticClient: OpticBackendClient,
  file: Buffer
) => {
  const uploadUrl = await opticClient.getUploadUrl();
  await (async (uploadUrl: string, file: Buffer) => {
    // TODO upload this file to s3 via aws sdk?
  })(uploadUrl, file);
  return "TODO get location of uploaded file";
};
