import { SpectralDsl } from "./dsl";
import { oas } from "@stoplight/spectral-rulesets";

const ruleset = {
  extends: [[oas, "all"]],
};

export const defaultEmptySpec: any = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: {},
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};

const result = new SpectralDsl(defaultEmptySpec, [], ruleset);
result.run();
