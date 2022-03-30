import { IChange, IPathComponent, ChangeVariant, OpenApiKind } from '../types';
import equals from 'lodash.isequal';
import { OpenAPIV3 } from 'openapi-types';

export class ChangelogSelector {
  constructor(private changelog: IChange[]) {}

  changes() {
    return this.changelog;
  }

  filterKind(openApiKind: OpenApiKind) {
    return new ChangelogSelector(
      this.changelog.filter((i) => i.location.kind === openApiKind)
    );
  }

  findParent(child: IChange) {
    return this.changelog.find((change) =>
      parentOfChild(
        change.location.conceptualPath,
        child.location.conceptualPath
      )
    );
  }

  findChildren(parent: IChange) {
    return this.changelog.filter((change) =>
      parentOfChild(
        parent.location.conceptualPath,
        change.location.conceptualPath
      )
    );
  }

  filter(predicate: (change: IChange) => boolean) {
    return new ChangelogSelector(
      this.changelog.filter(predicate as (change: IChange) => boolean)
    );
  }

  filterToOperation(httpMethod: OpenAPIV3.HttpMethods, pathPattern: string) {
    return this.filter(
      (change) =>
        'path' in change.location.conceptualLocation &&
        change.location.conceptualLocation.path === pathPattern &&
        change.location.conceptualLocation.method === httpMethod
    );
  }

  filterToQueryParameters() {
    return this.filter(
      (change) =>
        'inRequest' in change.location.conceptualLocation &&
        'query' in change.location.conceptualLocation.inRequest
    );
  }

  filterToHeaderParameters() {
    return this.filter(
      (change) =>
        'inRequest' in change.location.conceptualLocation &&
        'header' in change.location.conceptualLocation.inRequest
    );
  }

  filterToRequestBody(contentType: string) {
    return this.filter(
      (change) =>
        'inRequest' in change.location.conceptualLocation &&
        'body' in change.location.conceptualLocation.inRequest &&
        change.location.conceptualLocation.inRequest.body.contentType ===
          contentType
    );
  }

  filterToResponseBody(statusCode: string, contentType: string) {
    return this.filter(
      (change) =>
        'inResponse' in change.location.conceptualLocation &&
        'body' in change.location.conceptualLocation.inResponse &&
        change.location.conceptualLocation.inResponse.body.contentType ===
          contentType &&
        change.location.conceptualLocation.inResponse.statusCode === statusCode
    );
  }

  find(predicate: (change: IChange) => boolean): IChange | undefined {
    return this.changelog.find(predicate as (change: IChange) => boolean) as
      | IChange
      | undefined;
  }

  some(predicate: (change: IChange) => boolean): boolean {
    return this.changelog.some(predicate as (change: IChange) => boolean);
  }

  every(predicate: (change: IChange) => boolean): boolean {
    return this.changelog.every(predicate as (change: IChange) => boolean);
  }

  onlyAdded() {
    return new ChangelogSelector(
      this.changelog.filter((i) => Boolean(i.added))
    );
  }
  onlyAddedOrChanged() {
    return new ChangelogSelector(
      this.changelog.filter((i) => Boolean(i.added) || Boolean(i.changed))
    );
  }
  onlyChanged() {
    return new ChangelogSelector(
      this.changelog.filter((i) => Boolean(i.changed))
    );
  }
  onlyRemoved() {
    return new ChangelogSelector(
      this.changelog.filter((i) => Boolean(i.removed))
    );
  }

  filterToRequestBodies() {
    return this.filter(
      (change) =>
        'inRequest' in change.location.conceptualLocation &&
        'body' in change.location.conceptualLocation.inRequest
    );
  }

  filterToResponseBodies() {
    return this.filter(
      (change) =>
        'inResponse' in change.location.conceptualLocation &&
        'body' in change.location.conceptualLocation.inResponse
    );
  }

  // helpers
  hasOperationChanged(
    httpMethod: OpenAPIV3.HttpMethods,
    pathPattern: string
  ): ChangeVariant<OpenApiKind.Operation> | false {
    const changedOperation =
      (this.filterKind(OpenApiKind.Operation).find(
        (change) =>
          'path' in change.location.conceptualLocation &&
          change.location.conceptualLocation.path === pathPattern &&
          change.location.conceptualLocation.method === httpMethod
      ) as ChangeVariant<OpenApiKind.Operation>) || undefined;
    return changedOperation || false;
  }

  hasQueryParameterChanged(
    name: string
  ): ChangeVariant<OpenApiKind.QueryParameter> | false {
    const changeQueryParam =
      (this.filterToQueryParameters().find((param) => {
        if ('inRequest' in param.location.conceptualLocation) {
          if ('query' in param.location.conceptualLocation.inRequest) {
            return param.location.conceptualLocation.inRequest.query === name;
          }
        }

        return false;
      }) as ChangeVariant<OpenApiKind.QueryParameter>) || undefined;
    return changeQueryParam || false;
  }

  hasHeaderParameterChanged(
    name: string
  ): ChangeVariant<OpenApiKind.HeaderParameter> | false {
    const changeQueryParam =
      (this.filterToHeaderParameters().find((param) => {
        if ('inRequest' in param.location.conceptualLocation) {
          if ('header' in param.location.conceptualLocation.inRequest) {
            return param.location.conceptualLocation.inRequest.header === name;
          }
        }

        return false;
      }) as ChangeVariant<OpenApiKind.HeaderParameter>) || undefined;
    return changeQueryParam || false;
  }
}

export function queryChangelog(changelog: IChange[]) {
  return new ChangelogSelector(changelog);
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
