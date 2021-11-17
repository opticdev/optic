import { SpectralDsl } from "./dsl";

export const defaultEmptySpec: any = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: {},
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};

const result = new SpectralDsl(defaultEmptySpec);
// result.addRuleset();
