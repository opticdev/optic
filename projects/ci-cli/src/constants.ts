import { OpenAPIV3 } from "@useoptic/openapi-utilities";

export const defaultEmptySpec: OpenAPIV3.Document = {
  openapi: "3.0.1",
  paths: {},
  info: { version: "0.0.0", title: "Empty" },
};
