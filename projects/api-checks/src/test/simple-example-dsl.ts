// Specify your vocabulary
import { ApiCheckDsl, Result, runCheck, ShouldOrMust } from "../types";
import { OpenApiEndpointFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/OpenAPITraverser";
import flatten from "lodash.flatten";
import events from "events";

export interface SimpleExampleDsl extends ApiCheckDsl {
  operations: {
    added: ShouldOrMust<
      (statement: string, handler: (operationId: string) => void) => void
    >;
    changed: ShouldOrMust<
      (
        statement: string,
        handler: (currentOperationId: string, nextOperationId: string) => void
      ) => void
    >;
  };
}

export function createSimpleExampleDsl(): SimpleExampleDsl {
  const handlers: {
    key: string;
    statement: string;
    handler: any;
    must: boolean;
  }[] = [];

  return {
    operations: {
      added: {
        must: (statement, handler) => {
          handlers.push({
            statement,
            handler,
            key: "operation.added",
            must: true,
          });
        },
        should: (statement, handler) => {
          handlers.push({
            statement,
            handler,
            key: "operation.added",
            must: false,
          });
        },
      },
      changed: {
        must: (statement, handler) => {
          handlers.push({
            statement,
            handler,
            key: "changed.added",
            must: true,
          });
        },
        should: (statement, handler) => {
          handlers.push({
            statement,
            handler,
            key: "changed.added",
            must: false,
          });
        },
      },
    },
    run: async (facts, changelog) => {
      const addedEndpointResults: Result[] = await Promise.all(
        flatten(
          changelog
            .filter((i) => i.added && i.location.kind === "endpoint")
            .map((endpointAdded) => {
              return handlers
                .filter((i) => i.key === "operation.added")
                .map((checks) => {
                  const handler = checks.handler as (
                    operationId: string
                  ) => void;
                  const value = endpointAdded.added as OpenApiEndpointFact;
                  return runCheck(
                    `added endpoint ${value.method} ${value.pathPattern}`,
                    checks.statement,
                    checks.must,
                    () => {
                      handler(
                        (endpointAdded.added as OpenApiEndpointFact).operationId
                      );
                    }
                  );
                });
            })
        )
      );

      return [...addedEndpointResults];
    },
  };
}
