import {
  ApiCheckDsl,
  EntityRule,
  Result,
  runCheck,
} from "@useoptic/api-checks";
import {
  IChange,
  IFact,
  ILocation,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiHeaderFact,
  ConceptualLocation,
} from "@useoptic/openapi-utilities";

export interface SynkApiCheckContext {}

export interface SnykEntityRule<T>
  extends EntityRule<T, ConceptualLocation, SynkApiCheckContext> {}

export interface ISnykApiCheckDsl extends ApiCheckDsl {
  operations: SnykEntityRule<OpenApiOperationFact>;
}

export class SnykApiCheckDsl implements ISnykApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private changelog: IChange<any>[],
    private context: SynkApiCheckContext
  ) {}

  checkPromises() {
    return this.checks;
  }

  getContext(location: ILocation): ConceptualLocation & SynkApiCheckContext {
    return {
      ...location.conceptualLocation,
      ...this.context,
    };
  }

  get operations(): SnykEntityRule<OpenApiOperationFact> {
    const operations = this.changelog.filter(
      (i) => i.location.kind === OpenApiKind.Operation
    );

    const added = operations.filter((i) =>
      Boolean(i.added)
    ) as IChange<OpenApiOperationFact>[];
    const changes = operations.filter((i) =>
      Boolean(i.changed)
    ) as IChange<OpenApiOperationFact>[];

    const requirements: IFact<OpenApiOperationFact>[] = this.nextFacts.filter(
      (i) => i.location.kind === OpenApiKind.Operation
    );

    const addedHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiOperationFact>["added"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...added.map((endpoint, index) => {
            const addedWhere = `added operation: ${endpoint.added!.method} ${
              endpoint.added!.pathPattern
            }`;
            return runCheck(endpoint, addedWhere, statement, must, () =>
              handler(endpoint.added!, this.getContext(endpoint.location))
            );
          })
        );
      };
    };

    const changedHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiOperationFact>["changed"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...added.map((endpoint, index) => {
            const updatedWhere = `updated operation: ${
              endpoint.changed!.after.method
            } ${endpoint.changed!.after.pathPattern}`;
            return runCheck(endpoint, updatedWhere, statement, must, () =>
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
    ) => SnykEntityRule<OpenApiOperationFact>["requirement"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...requirements.map((endpoint, index) => {
            const where = `operation: ${endpoint.value.method} ${endpoint.value.pathPattern}`;
            return runCheck(endpoint, where, statement, must, () =>
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

  get headers(): SnykEntityRule<OpenApiHeaderFact> {
    const headers = this.changelog.filter(
      (i) => i.location.kind === OpenApiKind.HeaderParameter
    );

    const added = headers.filter((i) =>
      Boolean(i.added)
    ) as IChange<OpenApiHeaderFact>[];
    const changes = headers.filter((i) =>
      Boolean(i.changed)
    ) as IChange<OpenApiHeaderFact>[];

    const requirements: IFact<OpenApiHeaderFact>[] = this.nextFacts.filter(
      (i) => i.location.kind === OpenApiKind.HeaderParameter
    );

    const addedHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiHeaderFact>["added"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...added.map((header, index) => {
            const addedWhere = `added header: ${header.added!.name}`;
            return runCheck(header, addedWhere, statement, must, () =>
              handler(header.added!, this.getContext(header.location))
            );
          })
        );
      };
    };

    const changedHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiHeaderFact>["changed"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...added.map((header, index) => {
            const updatedWhere = `updated header: ${
              header.changed!.after.name
            }`;
            return runCheck(header, updatedWhere, statement, must, () =>
              handler(
                header.changed!.before,
                header.changed!.after,
                this.getContext(header.location)
              )
            );
          })
        );
      };
    };

    const requirementsHandler: (
      must: boolean
    ) => SnykEntityRule<OpenApiHeaderFact>["requirement"]["must"] = (
      must: boolean
    ) => {
      return (statement, handler) => {
        this.checks.push(
          ...requirements.map((header, index) => {
            const where = `header: ${header.value.name} `;
            return runCheck(header, where, statement, must, () =>
              handler(header.value, this.getContext(header.location))
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
