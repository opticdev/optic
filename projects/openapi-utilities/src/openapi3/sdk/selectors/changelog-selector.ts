import {
  IChange,
  IPathComponent,
  OpenApiFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
} from '../types';
import equals from 'lodash.isequal';
import { OpenAPIV3 } from 'openapi-types';

export class ChangelogSelector {
  constructor(private changelog: IChange<OpenApiFact>[]) {}

  changes() {
    return this.changelog;
  }

  filterKind(openApiKind: OpenApiKind) {
    return new ChangelogSelector(
      this.changelog.filter((i) => i.location.kind === openApiKind)
    );
  }

  findParent(child: IChange<OpenApiFact>) {
    return this.changelog.find((change) =>
      parentOfChild(
        change.location.conceptualPath,
        child.location.conceptualPath
      )
    );
  }

  findChildren(parent: IChange<OpenApiFact>) {
    return this.changelog.filter((change) =>
      parentOfChild(
        parent.location.conceptualPath,
        change.location.conceptualPath
      )
    );
  }

  filter<G = OpenApiFact>(predicate: (change: IChange<G>) => boolean) {
    return new ChangelogSelector(
      this.changelog.filter(
        predicate as (change: IChange<OpenApiFact>) => boolean
      )
    );
  }

  filterToOperation(httpMethod: OpenAPIV3.HttpMethods, pathPattern: string) {
    return this.filter(
      (change) =>
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

  find<G = OpenApiFact>(
    predicate: (change: IChange<G>) => boolean
  ): IChange<G> | undefined {
    return this.changelog.find(
      predicate as (change: IChange<OpenApiFact>) => boolean
    ) as IChange<G> | undefined;
  }

  some<G = OpenApiFact>(predicate: (change: IChange<G>) => boolean): boolean {
    return this.changelog.some(
      predicate as (change: IChange<OpenApiFact>) => boolean
    );
  }

  every<G = OpenApiFact>(predicate: (change: IChange<G>) => boolean): boolean {
    return this.changelog.every(
      predicate as (change: IChange<OpenApiFact>) => boolean
    );
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
  ): IChange<OpenApiOperationFact> | false {
    const changedOperation = this.filterKind(OpenApiKind.Operation).find(
      (operation: IChange<OpenApiOperationFact>) =>
        operation.location.conceptualLocation.path === pathPattern &&
        operation.location.conceptualLocation.method === httpMethod
    );
    return changedOperation || false;
  }

  hasQueryParameterChanged(
    name: string
  ): IChange<OpenApiRequestParameterFact> | false {
    const changeQueryParam = this.filterToQueryParameters().find(
      (param: IChange<OpenApiRequestParameterFact>) => {
        if ('inRequest' in param.location.conceptualLocation) {
          if ('query' in param.location.conceptualLocation.inRequest) {
            return param.location.conceptualLocation.inRequest.query === name;
          }
        }

        return false;
      }
    );
    return changeQueryParam || false;
  }

  hasHeaderParameterChanged(
    name: string
  ): IChange<OpenApiRequestParameterFact> | false {
    const changeQueryParam = this.filterToHeaderParameters().find(
      (param: IChange<OpenApiRequestParameterFact>) => {
        if ('inRequest' in param.location.conceptualLocation) {
          if ('header' in param.location.conceptualLocation.inRequest) {
            return param.location.conceptualLocation.inRequest.header === name;
          }
        }

        return false;
      }
    );
    return changeQueryParam || false;
  }
}

export function queryChangelog(changelog: IChange<OpenApiFact>[]) {
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
