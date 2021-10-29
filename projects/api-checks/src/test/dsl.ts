import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import { ApiCheckDsl, Result, runCheck, ShouldOrMust } from "../types";
import { OpenApiEndpointFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/OpenAPITraverser";

export type SnykContext = {
  maturity: "wip" | "beta" | "ga";
};

type OperationsAddedDsl = ShouldOrMust<
  (
    statement: string,
    handler: (input: {
      operation: OpenApiEndpointFact;
      context: SnykContext;
    }) => void
  ) => void
>;
type OperationsChangedDsl = ShouldOrMust<
  (
    statement: string,
    handler: (input: {
      current: OpenApiEndpointFact;
      next: OpenApiEndpointFact;
      context: SnykContext;
    }) => void
  ) => void
>;

export class SnykApiDSL implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private changelog: IChange<any>[]
  ) {}

  getContext(): SnykContext {
    return {
      maturity: "wip",
    };
  }

  get operations() {
    const operations = this.changelog.filter(
      (i) => i.location.kind === "endpoint"
    );
    const context = this.getContext();
    const checks = this.checks;

    return {
      get added(): OperationsAddedDsl {
        const added = operations.filter((i) =>
          Boolean(i.added)
        ) as IChange<OpenApiEndpointFact>[];
        const where = added.map(
          (endpoint) =>
            `new operation: ${endpoint.location.conceptualPath.join(",")}`
        );
        return {
          should: async (statement, handler) => {
            checks.push(
              ...added.map((endpoint, index) => {
                return runCheck(where[index], statement, true, () =>
                  handler({ operation: endpoint.added!, context })
                );
              })
            );
          },
          must: (statement, handler) => {
            checks.push(
              ...added.map((endpoint, index) => {
                return runCheck(where[index], statement, false, () =>
                  handler({ operation: endpoint.added!, context })
                );
              })
            );
          },
        };
      },
      get changed(): OperationsChangedDsl {
        const changes = operations.filter((i) =>
          Boolean(i.changed)
        ) as IChange<OpenApiEndpointFact>[];
        const where = changes.map(
          (endpoint) =>
            `updated operation: ${endpoint.location.conceptualPath.join(",")}`
        );
        return {
          should: async (statement, handler) => {
            checks.push(
              ...changes.map((endpoint, index) => {
                return runCheck(where[index], statement, true, () =>
                  handler({
                    current: endpoint.changed!.before,
                    next: endpoint.changed!.after,
                    context,
                  })
                );
              })
            );
          },
          must: (statement, handler) => {
            checks.push(
              ...changes.map((endpoint, index) => {
                return runCheck(where[index], statement, false, () =>
                  handler({
                    current: endpoint.changed!.before,
                    next: endpoint.changed!.after,
                    context,
                  })
                );
              })
            );
          },
        };
      },
    };
  }

  checkPromises() {
    return this.checks;
  }
}
