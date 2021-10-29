// Specify your vocabulary
import { ApiCheckDsl, Result, runCheck, ShouldOrMust } from "../types";
import { OpenApiEndpointFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/OpenAPITraverser";
import flatten from "lodash.flatten";
import events from "events";
import { IChange } from "@useoptic/openapi-utilities/build/openapi3/sdk/types";

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

  const a: SimpleExampleDsl["operations"]["added"]["must"] = (
    statement,
    handler
  ) => {};

  const helper = (
    key: string,
    statement: string,
    handler: any,
    must: boolean
  ) => {
    handlers.push({
      statement,
      handler,
      key,
      must,
    });
  };

  return {
    operations: {
      added: {
        must: (statement, handler) =>
          helper("operation.added", statement, handler, true),
        should: (statement, handler) =>
          helper("operation.added", statement, handler, false),
      },
      changed: {
        must: (statement, handler) =>
          helper("operation.changed", statement, handler, true),
        should: (statement, handler) =>
          helper("operation.changed", statement, handler, false),
      },
    },
    run: async (facts, changelog) => {
      const checks: Promise<Result>[] = [];

      // collect and run endpoint added checks
      handlers
        .filter((i) => i.key === "operation.added")
        .forEach(({ handler, must, statement }) => {
          const addedEndpoints = collectAdded<OpenApiEndpointFact>(
            facts,
            (change) =>
              change.location.kind === "endpoint" && Boolean(change.added)
          );
          addedEndpoints.forEach((added) => {
            checks.push(
              runCheck(
                `operation added ${added.added!.method} ${
                  added.added!.pathPattern
                }`,
                statement,
                must,
                () => handler(added.added!.operationId)
              )
            );
          });
        });

      return await Promise.all(checks);
    },
  };
}

function collectAdded<T>(
  changelog: IChange<T>[],
  predicate: (change: IChange<T>) => boolean
) {
  return changelog.filter(predicate);
}
