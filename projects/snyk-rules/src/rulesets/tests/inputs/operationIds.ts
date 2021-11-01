import { OpenAPIV3 } from "@useoptic/openapi-utilities";

export const op001_before: OpenAPIV3.Document = {
  openapi: "3.0.1",
  paths: {},
  info: { version: "0.0.0", title: "Empty" },
};
export const op001_with_path_and_no_op_id: OpenAPIV3.Document = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: {
        responses: {},
      },
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};
export const op001_with_path_and_valid_op_id: OpenAPIV3.Document = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: {
        operationId: "hello-world",
        responses: {},
      },
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};
