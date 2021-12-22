import niceTry from 'nice-try';
import {
  ConceptualLocation,
  IChange,
  IFact,
  ILocation,
  OpenApiFact,
  OpenApiFieldFact,
  OpenApiHeaderFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
  OpenApiResponseFact,
  OpenAPIV3,
  queryChangelog,
} from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  ApiCheckDsl,
  DocsLinkHelper,
  EntityRule,
  newDocsLinkHelper,
  Result,
  runCheck,
  ShouldOrMust,
} from './types';
import { genericEntityRuleImpl } from './generic-entity-rule-impl';
import { createSelectJsonPathHelper } from './select-when-rule';

export interface ApiCheckDslContext {}

export interface ApiCheckEntityRule<T, A>
  extends EntityRule<T, ConceptualLocation, ApiCheckDslContext, A> {}

export class ApiChangeDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<OpenApiFact>[],
    private changelog: IChange<OpenApiFact>[],
    private currentJsonLike: OpenAPIV3.Document,
    private nextJsonLike: OpenAPIV3.Document,
    private providedContext: ApiCheckDslContext
  ) {}

  checkPromises() {
    return this.checks;
  }

  getContext(location: ILocation): ConceptualLocation & ApiCheckDslContext {
    return {
      ...location.conceptualLocation,
      ...this.providedContext,
    };
  }

  get operations() {
    const operations = this.changelog.filter(
      (i) => i.location.kind === OpenApiKind.Operation
    );

    const added = operations.filter((i) =>
      Boolean(i.added)
    ) as IChange<OpenApiOperationFact>[];
    const removed = operations.filter((i) =>
      Boolean(i.removed)
    ) as IChange<OpenApiOperationFact>[];
    const changes = operations.filter((i) =>
      Boolean(i.changed)
    ) as IChange<OpenApiOperationFact>[];

    const locations = [
      ...added.map((i) => i.location),
      ...changes.map((i) => i.location),
      ...removed.map((i) => i.location),
    ];

    const pathsSelectorsInputs = locations.map((i) => {
      return {
        conceptualLocation: i.conceptualLocation,
        current:
          niceTry(() =>
            jsonPointerHelpers.get(this.currentJsonLike, i.jsonPath)
          ) || {},
        next:
          niceTry(() =>
            jsonPointerHelpers.get(this.nextJsonLike, i.jsonPath)
          ) || {},
      };
    });

    const { selectJsonPath } = createSelectJsonPathHelper(pathsSelectorsInputs);

    return {
      selectJsonPath,
      ...genericEntityRuleImpl<
        OpenApiOperationFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.OperationObject
      >(
        OpenApiKind.Operation,
        this.changelog,
        this.nextFacts,
        (opFact) => `${opFact.method.toUpperCase()} ${opFact.pathPattern}`,
        (location) => this.getContext(location),
        (...items) => this.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(this.nextJsonLike, pointer)
      ),
    };
  }

  get specification() {
    const change: IChange<any> = {
      location: {
        conceptualLocation: { path: 'Specification', method: '' },
        jsonPath: '/',
        conceptualPath: [],
        kind: 'API',
      },
    } as any;

    const value: ShouldOrMust<
      (
        document: OpenAPIV3.Document,
        context: ApiCheckDslContext,
        docs: DocsLinkHelper
      ) => Promise<void> | void
    > = {
      must: (statement, handler) => {
        const docsHelper = newDocsLinkHelper();
        this.checks.push(
          runCheck(
            change,
            docsHelper,
            'this specification: ',
            statement,
            true,
            () => handler(this.nextJsonLike, this.providedContext, docsHelper)
          )
        );
      },
      should: (statement, handler) => {
        const docsHelper = newDocsLinkHelper();
        this.checks.push(
          runCheck(
            change,
            docsHelper,
            'this specification: ',
            statement,
            false,
            () => handler(this.nextJsonLike, this.providedContext, docsHelper)
          )
        );
      },
    };

    return {
      requirement: value,
    };
  }

  get request() {
    const dsl = this;

    return {
      queryParameter: genericEntityRuleImpl<
        OpenApiRequestParameterFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.ParameterObject
      >(
        OpenApiKind.QueryParameter,
        dsl.changelog,
        dsl.nextFacts,
        (query) => `${query.name}`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
      pathParameter: genericEntityRuleImpl<
        OpenApiRequestParameterFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.ParameterObject
      >(
        OpenApiKind.PathParameter,
        dsl.changelog,
        dsl.nextFacts,
        (path) => `${path.name}`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
      headerParameter: genericEntityRuleImpl<
        OpenApiRequestParameterFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.ParameterObject
      >(
        OpenApiKind.HeaderParameter,
        dsl.changelog,
        dsl.nextFacts,
        (header) => `${header.name}`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
      bodyProperties: genericEntityRuleImpl<
        OpenApiFieldFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.SchemaObject
      >(
        OpenApiKind.Field,
        queryChangelog(dsl.changelog)
          .filter((i) => {
            if (
              i.location.kind === OpenApiKind.Field &&
              'inResponse' in i.location.conceptualLocation
            )
              return false;
            return true;
          })
          .changes(),
        dsl.nextFacts,
        (field) => `request body '${field.key}'`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
    };
  }

  get responses() {
    const dsl = this;

    return {
      ...genericEntityRuleImpl<
        OpenApiResponseFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.ResponsesObject
      >(
        OpenApiKind.Response,
        dsl.changelog,
        dsl.nextFacts,
        (response) => `${response.statusCode}`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
      bodyProperties: genericEntityRuleImpl<
        OpenApiFieldFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.SchemaObject
      >(
        OpenApiKind.Field,
        queryChangelog(dsl.changelog)
          .filter((i) => {
            if (
              i.location.kind === OpenApiKind.Field &&
              'inRequest' in i.location.conceptualLocation
            )
              return false;
            return true;
          })
          .changes(),
        dsl.nextFacts,
        (field) => `response body '${field.key}'`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
      header: genericEntityRuleImpl<
        OpenApiHeaderFact,
        ConceptualLocation,
        ApiCheckDslContext,
        OpenAPIV3.HeaderObject
      >(
        OpenApiKind.ResponseHeader,
        dsl.changelog,
        dsl.nextFacts,
        (header) => `${header.name}`,
        (location) => dsl.getContext(location),
        (...items) => dsl.checks.push(...items),
        (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
      ),
    };
  }

  get bodyProperties(): ApiCheckEntityRule<
    OpenApiFieldFact,
    OpenAPIV3.SchemaObject
  > {
    const dsl = this;
    return genericEntityRuleImpl<
      OpenApiFieldFact,
      ConceptualLocation,
      ApiCheckDslContext,
      OpenAPIV3.SchemaObject
    >(
      OpenApiKind.Field,
      dsl.changelog,
      dsl.nextFacts,
      (field) => `${field.key}`,
      (location) => dsl.getContext(location),
      (...items) => dsl.checks.push(...items),
      (pointer: string) => jsonPointerHelpers.get(dsl.nextJsonLike, pointer)
    );
  }
}
