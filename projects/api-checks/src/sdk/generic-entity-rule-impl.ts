import {
  IChange,
  OpenApiKind,
  IFact,
  ILocation,
  ConceptualLocation,
  OpenApiFact,
} from "@useoptic/openapi-utilities";
import { EntityRule, newDocsLinkHelper, Result, runCheck } from "./types";

export function genericEntityRuleImpl<
  NarrowedOpenApiFact, // TODO require Type to be a type of `OpenApiFact`
  ApiContext,
  DslContext,
  OpenApiEntityType
>(
  openApiKind: OpenApiKind,
  changelog: IChange<OpenApiFact>[],
  nextFacts: IFact<OpenApiFact>[],
  describeWhere: (fact: NarrowedOpenApiFact) => string,
  getContext: (location: ILocation) => ApiContext & DslContext,
  pushCheck: (...check: Promise<Result>[]) => void,
  getSpecItem: (pointer: string) => OpenApiEntityType
): EntityRule<NarrowedOpenApiFact, ApiContext, DslContext, OpenApiEntityType> {
  const operationsAdded = changelog
    .filter((i) => i.location.kind === OpenApiKind.Operation && i.added)
    .map((i) => i.location.conceptualLocation);

  const operationsRemoved = changelog
    .filter((i) => i.location.kind === OpenApiKind.Operation && i.removed)
    .map((i) => i.location.conceptualLocation);

  const skipIfParentOperationAdded = (location: ConceptualLocation) => {
    if (openApiKind === OpenApiKind.Operation) return false;
    return operationsAdded.some(
      (i) => i.path === location.path && i.method === location.method
    );
  };

  const skipIfParentOperationRemoved = (location: ConceptualLocation) => {
    if (openApiKind === OpenApiKind.Operation) return false;
    return operationsRemoved.some(
      (i) => i.path === location.path && i.method === location.method
    );
  };

  const changesForKind = changelog.filter(
    (i) => i.location.kind === openApiKind
  );

  const added = changesForKind.filter((i) =>
    Boolean(i.added)
  ) as IChange<NarrowedOpenApiFact>[];
  const removed = changesForKind.filter((i) =>
    Boolean(i.removed)
  ) as IChange<NarrowedOpenApiFact>[];
  const changes = changesForKind.filter((i) =>
    Boolean(i.changed)
  ) as IChange<NarrowedOpenApiFact>[];

  const requirements: IFact<NarrowedOpenApiFact>[] = nextFacts.filter(
    (i) => i.location.kind === openApiKind
  ) as IFact<NarrowedOpenApiFact>[];

  const addedHandler: (
    must: boolean
  ) => EntityRule<
    NarrowedOpenApiFact,
    ApiContext,
    DslContext,
    OpenApiEntityType
  >["added"]["must"] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...added
          .filter((addRule) => {
            // should not run added rule if the parent operation was also added.
            return !skipIfParentOperationAdded(
              addRule.location.conceptualLocation
            );
          })
          .map((item, index) => {
            const addedWhere = `added ${openApiKind.toString()}: ${describeWhere(
              item.added!
            )}`;
            const docsHelper = newDocsLinkHelper();
            return runCheck(item, docsHelper, addedWhere, statement, must, () =>
              handler(item.added!, getContext(item.location), docsHelper)
            );
          })
      );
    };
  };

  const removedHandler: (
    must: boolean
  ) => EntityRule<
    NarrowedOpenApiFact,
    ApiContext,
    DslContext,
    OpenApiEntityType
  >["removed"]["must"] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...removed
          .filter((addRule) => {
            // should not run added rule if the parent operation was also added.
            return !skipIfParentOperationRemoved(
              addRule.location.conceptualLocation
            );
          })
          .map((item, index) => {
            const addedWhere = `removed ${openApiKind.toString()}: ${describeWhere(
              item.removed!.before!
            )}`;
            const docsHelper = newDocsLinkHelper();
            return runCheck(item, docsHelper, addedWhere, statement, must, () =>
              handler(item.added!, getContext(item.location), docsHelper)
            );
          })
      );
    };
  };

  const changedHandler: (
    must: boolean
  ) => EntityRule<
    NarrowedOpenApiFact,
    ApiContext,
    DslContext,
    OpenApiEntityType
  >["changed"]["must"] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...changes.map((item, index) => {
          const updatedWhere = `updated ${openApiKind.toString()}: ${describeWhere(
            item.changed!.after!
          )}`;
          const docsHelper = newDocsLinkHelper();
          return runCheck(item, docsHelper, updatedWhere, statement, must, () =>
            handler(
              item.changed!.before,
              item.changed!.after,
              getContext(item.location),
              docsHelper
            )
          );
        })
      );
    };
  };

  const requirementsHandler: (
    must: boolean
  ) => EntityRule<
    NarrowedOpenApiFact,
    ApiContext,
    DslContext,
    OpenApiEntityType
  >["requirement"]["must"] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...requirements.map((item, index) => {
          const where = `requirement for ${openApiKind.toString()}: ${describeWhere(
            item.value
          )}`;
          const docsHelper = newDocsLinkHelper();

          let specItem: OpenApiEntityType | undefined;
          try {
            specItem = getSpecItem(item.location.jsonPath);
          } catch (e) {
            throw new Error(
              "JSON trail does not resolve " + item.location.jsonPath
            );
          }

          return runCheck(item, docsHelper, where, statement, must, () =>
            handler(
              item.value,
              getContext(item.location),
              docsHelper,
              specItem || ({} as OpenApiEntityType)
            )
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
    removed: {
      must: removedHandler(true),
      should: removedHandler(false),
    },
    requirement: {
      must: requirementsHandler(true),
      should: requirementsHandler(false),
    },
  };
}
