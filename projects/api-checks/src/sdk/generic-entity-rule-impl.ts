import {
  IChange,
  IFact,
  ILocation,
  OpenApiFact,
  OpenApiKind,
  OpenApiOperationFact,
} from '@useoptic/openapi-utilities';
import {
  EntityRule,
  newDocsLinkHelper,
  Result,
  runCheck,
  StructuralContext,
} from './types';
import equals from 'lodash.isequal';
import { IPathComponent } from '@useoptic/openapi-utilities/build/openapi3/sdk/types';

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
  const wasParentAdded = (location: IPathComponent[]) => {
    return changelog.some((i) => {
      if (i.added) {
        return parentOfChild(i.location.conceptualPath, location);
      }
    });
  };

  const getStructuralContext = (location: ILocation): StructuralContext => {
    return {
      directParentAdded: wasParentAdded(location.conceptualPath),
      operationAdded: changelog.some((i) => {
        if (i.added && i.location.kind === OpenApiKind.Operation) {
          const fact = i.added as OpenApiOperationFact;
          return (
            fact.method === i.location.conceptualLocation.method &&
            fact.pathPattern === i.location.conceptualLocation.path
          );
        }
      }),
      responseAdded: changelog.some((i) => {
        if (
          i.added &&
          i.location.kind === OpenApiKind.Response &&
          'inResponse' in location.conceptualLocation &&
          'inResponse' in i.location.conceptualLocation
        ) {
          return (
            location.conceptualLocation.inResponse.statusCode ===
            i.location.conceptualLocation.inResponse.statusCode
          );
        }
      }),
      bodyAdded: changelog.some((i) => {
        if (
          i.added &&
          i.location.kind === OpenApiKind.Body &&
          'inRequest' in location.conceptualLocation &&
          'body' in location.conceptualLocation.inRequest &&
          'inRequest' in i.location.conceptualLocation &&
          'body' in i.location.conceptualLocation.inRequest
        ) {
          return (
            location.conceptualLocation.inRequest.body.contentType ===
            i.location.conceptualLocation.inRequest.body.contentType
          );
        }
        if (
          i.added &&
          i.location.kind === OpenApiKind.Body &&
          'inResponse' in location.conceptualLocation &&
          'body' in location.conceptualLocation.inResponse &&
          'inResponse' in i.location.conceptualLocation &&
          'body' in i.location.conceptualLocation.inResponse
        ) {
          return (
            location.conceptualLocation.inResponse.body.contentType ===
              i.location.conceptualLocation.inResponse.body.contentType &&
            location.conceptualLocation.inResponse.statusCode ===
              i.location.conceptualLocation.inResponse.statusCode
          );
        }
      }),
    };
  };

  const wasParentRemoved = (location: IPathComponent[]) => {
    return changelog.some((i) => {
      if (i.removed) {
        return parentOfChild(i.location.conceptualPath, location);
      }
    });
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
  >['added']['must'] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...added
          // .filter((addRule) => {
          //   // should not run added rule if the parent operation was also added.
          //   return !wasParentAdded(addRule.location.conceptualPath);
          // })
          .map((item, index) => {
            const addedWhere = `added ${openApiKind.toString()}: ${describeWhere(
              item.added!
            )}`;

            let specItem: OpenApiEntityType | undefined;
            try {
              specItem = getSpecItem(item.location.jsonPath);
            } catch (e) {
              throw new Error(
                'JSON trail does not resolve ' + item.location.jsonPath
              );
            }

            const docsHelper = newDocsLinkHelper();
            return runCheck(item, docsHelper, addedWhere, statement, must, () =>
              handler(
                item.added!,
                {
                  ...getContext(item.location),
                  ...getStructuralContext(item.location),
                },
                docsHelper,
                specItem!
              )
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
  >['removed']['must'] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...removed
          .filter((addRule) => {
            // should not run added rule if the parent operation was also added.
            return !wasParentRemoved(addRule.location.conceptualPath);
          })
          .map((item, index) => {
            const addedWhere = `removed ${openApiKind.toString()}: ${describeWhere(
              item.removed!.before!
            )}`;
            const docsHelper = newDocsLinkHelper();
            return runCheck(item, docsHelper, addedWhere, statement, must, () =>
              handler(
                item.added!,
                {
                  ...getContext(item.location),
                  ...getStructuralContext(item.location),
                },
                docsHelper
              )
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
  >['changed']['must'] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...changes.map((item, index) => {
          const updatedWhere = `updated ${openApiKind.toString()}: ${describeWhere(
            item.changed!.after!
          )}`;
          const docsHelper = newDocsLinkHelper();

          let specItem: OpenApiEntityType | undefined;
          try {
            specItem = getSpecItem(item.location.jsonPath);
          } catch (e) {
            throw new Error(
              'JSON trail does not resolve ' + item.location.jsonPath
            );
          }

          return runCheck(item, docsHelper, updatedWhere, statement, must, () =>
            handler(
              item.changed!.before,
              item.changed!.after,
              {
                ...getContext(item.location),
                ...getStructuralContext(item.location),
              },
              docsHelper,
              specItem!
            )
          );
        })
      );
    };
  };

  const requirementOnChange: (
    must: boolean
  ) => EntityRule<
    NarrowedOpenApiFact,
    ApiContext,
    DslContext,
    OpenApiEntityType
  >['requirementOnChange']['must'] = (must: boolean) => {
    return (statement, handler) => {
      pushCheck(
        ...changes.map((item, index) => {
          const updatedWhere = `updated ${openApiKind.toString()}: ${describeWhere(
            item.changed!.after!
          )}`;
          const docsHelper = newDocsLinkHelper();

          let specItem: OpenApiEntityType | undefined;
          try {
            specItem = getSpecItem(item.location.jsonPath);
          } catch (e) {
            throw new Error(
              'JSON trail does not resolve ' + item.location.jsonPath
            );
          }

          return runCheck(item, docsHelper, updatedWhere, statement, must, () =>
            handler(
              item.changed!.after,
              {
                ...getContext(item.location),
                ...getStructuralContext(item.location),
              },
              docsHelper,
              specItem!
            )
          );
        }),
        ...added
          // .filter((addRule) => {
          //   // should not run added rule if the parent operation was also added.
          //   return !wasParentAdded(addRule.location.conceptualPath);
          // })
          .map((item, index) => {
            const addedWhere = `added ${openApiKind.toString()}: ${describeWhere(
              item.added!
            )}`;

            let specItem: OpenApiEntityType | undefined;
            try {
              specItem = getSpecItem(item.location.jsonPath);
            } catch (e) {
              throw new Error(
                'JSON trail does not resolve ' + item.location.jsonPath
              );
            }

            const docsHelper = newDocsLinkHelper();
            return runCheck(item, docsHelper, addedWhere, statement, must, () =>
              handler(
                item.added!,
                {
                  ...getContext(item.location),
                  ...getStructuralContext(item.location),
                },
                docsHelper,
                specItem!
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
  >['requirement']['must'] = (must: boolean) => {
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
              'JSON trail does not resolve ' + item.location.jsonPath
            );
          }

          return runCheck(
            // How does this even work? `requirements` are defined as a IFact, but runCheck expects IChange
            // And these types don't overlap
            item as any,
            docsHelper,
            where,
            statement,
            must,
            () =>
              handler(
                item.value,
                {
                  ...getContext(item.location),
                  ...getStructuralContext(item.location),
                },
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
    requirementOnChange: {
      must: requirementOnChange(true),
      should: requirementOnChange(false),
    },
  };
}

function parentOfChild(
  parent: IPathComponent[],
  child: IPathComponent[]
): boolean {
  return (
    child.length > parent.length &&
    equals(parent, child.slice(0, parent.length))
  );
}
