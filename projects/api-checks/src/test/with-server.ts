import { createApiCheckService } from "../api-check-service";
import { createSimpleExampleDsl } from "./simple-example-dsl";
const chai = require("chai").expect;

const { operations } = createApiCheckService(5000).useDsl(
  createSimpleExampleDsl()
);

operations.added.must("have an operation id", (operationId: string) => {
  expect(operationId).toBeTruthy();
});
