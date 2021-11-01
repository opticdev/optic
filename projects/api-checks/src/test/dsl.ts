import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import {
  ApiCheckDsl,
  EntityRule,
  Result,
  runCheck,
  ShouldOrMust,
} from "../types";
import { OpenApiEndpointFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/OpenAPITraverser";

export type SnykContext = {
  maturity: "wip" | "beta" | "ga";
};

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

  get operations(): EntityRule<OpenApiEndpointFact, {}, SnykContext> {
    const operations = this.changelog.filter(
      (i) => i.location.kind === "endpoint"
    );
    const context = this.getContext();
    const checks = this.checks;

    const added = operations.filter((i) =>
      Boolean(i.added)
    ) as IChange<OpenApiEndpointFact>[];
    const addedWhere = added.map(
      (endpoint) =>
        `new operation: ${endpoint.location.conceptualPath.join(",")}`
    );

    const changes = operations.filter((i) =>
      Boolean(i.changed)
    ) as IChange<OpenApiEndpointFact>[];
    const changedWhere = changes.map(
      (endpoint) =>
        `updated operation: ${endpoint.location.conceptualPath.join(",")}`
    );

    return {
      added: {
        must: async (statement, handler) => {
          checks.push(
            ...added.map((endpoint, index) => {
              return runCheck(addedWhere[index], statement, true, () =>
                handler(endpoint.added!, context)
              );
            })
          );
        },
        should: async (statement, handler) => {
          checks.push(
            ...added.map((endpoint, index) => {
              return runCheck(addedWhere[index], statement, false, () =>
                handler(endpoint.added!, context)
              );
            })
          );
        },
      },
      requirement: undefined as any,
      changed: {
        must: async (statement, handler) => {
          checks.push(
            ...changes.map((endpoint, index) => {
              return runCheck(changedWhere[index], statement, true, () =>
                handler(
                  endpoint.changed!.before,
                  endpoint.changed!.after,
                  context
                )
              );
            })
          );
        },
        should: async (statement, handler) => {
          checks.push(
            ...changes.map((endpoint, index) => {
              return runCheck(changedWhere[index], statement, false, () =>
                handler(
                  endpoint.changed!.before,
                  endpoint.changed!.after,
                  context
                )
              );
            })
          );
        },
      },
    };
  }

  checkPromises() {
    return this.checks;
  }
}
