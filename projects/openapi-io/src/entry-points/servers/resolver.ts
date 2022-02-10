import { IncomingMessage } from "http";
import { URL } from "url";
import corsMiddleware from "micro-cors";
import { parseOpenAPIWithSourcemap } from "../../parser/openapi-sourcemap-parser";

const handler = async (req: IncomingMessage, res: any) => {
  if (!req.url) {
    throw new Error(`expected request to have a url`);
  }
  const baseURL = `http://anyhost`;
  const url = new URL(req.url, baseURL);
  const filePath = url.searchParams.get("filePath");
  if (!filePath) {
    throw new Error(`expected request to have a filePath query parameter`);
  }

  const parsedFilePath = new URL(filePath);

  const result = await parseOpenAPIWithSourcemap(filePath);
  return result;
};

export default corsMiddleware()(handler);
