import { OpenApiEndpointFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/OpenAPITraverser";
import { ApiCheckDsl, EntityRule, Result } from "@useoptic/api-checks";
import {
  IChange,
  IFact,
  ILocation,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import { runCheck } from "@useoptic/api-checks/build/types";
import { SnykContext } from "@useoptic/api-checks/build/test/dsl";
import { end } from "tap";

export interface SynkApiCheckContext {}

export interface ApiChangeLocationContext {
  inRequest: boolean;
  inResponse: boolean;
}

export interface SnykEntityRule<T>
  extends EntityRule<T, ApiChangeLocationContext, SynkApiCheckContext> {}

export interface ISnykApiCheckDsl extends ApiCheckDsl {
  operations: SnykEntityRule<OpenApiEndpointFact>;
}

export class SnykApiCheckDsl implements ISnykApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private changelog: IChange<any>[],
    private context: SynkApiCheckContext
  ) {
    null;
  }

  checkPromises(): Promise<Result>[] {
    return this.checks;
  }

  // @todo update this when the traverser context becomes more aligned with the use case
  getContext(
    location: ILocation
  ): ApiChangeLocationContext & SynkApiCheckContext {
    return {
      inResponse: location.conceptualPath.includes("responses"),
      inRequest: !location.conceptualPath.includes("responses"),
      ...this.context,
    };
  }

  get operations(): SnykEntityRule<OpenApiEndpointFact> {
    const operations = this.changelog.filter(
      (i) => i.location.kind === "endpoint"
    );

    const added = operations.filter((i) =>
      Boolean(i.added)
    ) as IChange<OpenApiEndpointFact>[];
    const changes = operations.filter((i) =>
      Boolean(i.changed)
    ) as IChange<OpenApiEndpointFact>[];

    const requirements: IFact<OpenApiEndpointFact>[] = this.nextFacts.filter(
      (i) => i.location.kind === "endpoint"
    );

    const addedHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiEndpointFact>["added"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...added.map((endpoint, index) => {
            const addedWhere = `added operation: ${endpoint.added!.method} ${
              endpoint.added!.pathPattern
            }`;
            return runCheck(addedWhere, statement, must, () =>
              handler(endpoint.added!, this.getContext(endpoint.location))
            );
          })
        );
      };
    };

    const changedHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiEndpointFact>["changed"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...added.map((endpoint, index) => {
            const updatedWhere = `updated operation: ${
              endpoint.changed!.after.method
            } ${endpoint.changed!.after.pathPattern}`;
            return runCheck(updatedWhere, statement, must, () =>
              handler(
                endpoint.changed!.before,
                endpoint.changed!.after,
                this.getContext(endpoint.location)
              )
            );
          })
        );
      };
    };

    const requirementsHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiEndpointFact>["requirement"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...requirements.map((endpoint, index) => {
            const where = `operation: ${endpoint.value.method} ${endpoint.value.pathPattern}`;
            return runCheck(where, statement, must, () =>
              handler(endpoint.value, this.getContext(endpoint.location))
            );
          })
        );
      };
    };

    return {
      added: {
        must: addedHandler(true),
        should: addedHandler(false),
      },
      changed: {
        must: changedHandler(true),
        should: changedHandler(false),
      },
      requirement: {
        must: requirementsHandler(true),
        should: requirementsHandler(false),
      },
    };
  }
}
