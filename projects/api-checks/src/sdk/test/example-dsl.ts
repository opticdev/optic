import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import {
  ApiCheckDsl,
  EntityRule,
  newDocsLinkHelper,
  Result,
  runCheck,
  ShouldOrMust,
} from "../types";
import { OpenApiOperationFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/openapi-traverser";
import { OpenApiKind } from "@useoptic/openapi-utilities";

export type ExampleDslContext = {
  maturity: "wip" | "beta" | "ga";
};

export class ExampleDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private changelog: IChange<any>[]
  ) {}

  getContext(): ExampleDslContext {
    return {
      maturity: "wip",
    };
  }

  get operations(): EntityRule<OpenApiOperationFact, {}, ExampleDslContext> {
    const operations = this.changelog.filter(
      (i) => i.location.kind === OpenApiKind.Operation
    );
    const context = this.getContext();
    const checks = this.checks;

    const added = operations.filter((i) =>
      Boolean(i.added)
    ) as IChange<OpenApiOperationFact>[];
    const addedWhere = added.map(
      (endpoint) =>
        `new operation: ${endpoint.location.conceptualPath.join(",")}`
    );

    const changes = operations.filter((i) =>
      Boolean(i.changed)
    ) as IChange<OpenApiOperationFact>[];
    const changedWhere = changes.map(
      (endpoint) =>
        `updated operation: ${endpoint.location.conceptualPath.join(",")}`
    );

    return {
      added: {
        must: async (statement, handler) => {
          checks.push(
            ...added.map((endpoint, index) => {
              const docsLinkHelper = newDocsLinkHelper();
              return runCheck(
                endpoint,
                docsLinkHelper,
                addedWhere[index],
                statement,
                true,
                () => handler(endpoint.added!, context, docsLinkHelper)
              );
            })
          );
        },
        should: async (statement, handler) => {
          const docsLinkHelper = newDocsLinkHelper();
          checks.push(
            ...added.map((endpoint, index) => {
              return runCheck(
                endpoint,
                docsLinkHelper,
                addedWhere[index],
                statement,
                false,
                () => handler(endpoint.added!, context, docsLinkHelper)
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
              const docsLinkHelper = newDocsLinkHelper();
              return runCheck(
                endpoint,
                docsLinkHelper,
                changedWhere[index],
                statement,
                true,
                () =>
                  handler(
                    endpoint.changed!.before,
                    endpoint.changed!.after,
                    context,
                    docsLinkHelper
                  )
              );
            })
          );
        },
        should: async (statement, handler) => {
          checks.push(
            ...changes.map((endpoint, index) => {
              const docsLinkHelper = newDocsLinkHelper();
              return runCheck(
                endpoint,
                docsLinkHelper,
                changedWhere[index],
                statement,
                false,
                () =>
                  handler(
                    endpoint.changed!.before,
                    endpoint.changed!.after,
                    context,
                    docsLinkHelper
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
