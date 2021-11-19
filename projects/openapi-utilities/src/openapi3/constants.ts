import { OpenAPIV3 } from "openapi-types";

export const defaultEmptySpec: OpenAPIV3.Document = {
  openapi: "3.1.3",
  paths: {},
  info: { version: "0.0.0", title: "Empty" },
};
