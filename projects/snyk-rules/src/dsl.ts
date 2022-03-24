import {
  ApiCheckDsl,
  EntityRule,
  Result,
  DocsLinkHelper,
  newDocsLinkHelper,
  runCheck,
  createSelectJsonPathHelper,
} from '@useoptic/api-checks';

import niceTry from 'nice-try';

import {
  ConceptualLocation,
  OpenApiHeaderFact,
  OpenApiKind,
  OpenApiOperationFact,
  IChange,
  IFact,
  OpenApiFieldFact,
  ILocation,
  OpenAPIV3,
  OpenApiRequestParameterFact,
  OpenApiResponseFact,
  OpenApiFact,
  ChangeType,
  ShouldOrMust,
  OperationLocation,
} from '@useoptic/openapi-utilities';
import { genericEntityRuleImpl } from '@useoptic/api-checks/build/sdk/generic-entity-rule-impl';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

type SnykStablity = 'wip' | 'experimental' | 'beta' | 'ga';
type DateString = string; // YYYY-mm-dd
type ResourceName = string;

export interface SynkApiCheckContext {
  // Vervet provides context about the change itself. Since
  // Optic is analyzing two OpenAPI spec files, we need to tell it
  // when the change is supposed to happen, and the resource/version info
  // determined by the file's location in a directory structure.
  changeDate: DateString; // when the change did (or would, if proposed) occur
  changeResource: ResourceName; // the spec resource being changed
  changeVersion: {
    // the spec version being changed
    date: DateString;
    stability: SnykStablity;
  };

  // Vervet provides a mapping that indicates the resource version deprecation.
  // It has this information because it processes the entire source tree of
  // spec files.
  resourceVersions: {
    [ResourceName: string]: {
      // changeResource used to match this
      [DateString: string]: {
        // changeVersion.date used to match this
        [SnykStablity: string]: {
          // changeVersion.stability matches this
          deprecatedBy: {
            // the spec version that deprecates this one (if any) or null
            date: DateString;
            stability: SnykStablity; // could be higher stability than changed!
          } | null;
        };
      };
    };
  };
}

export interface SnykEntityRule<T, A>
  extends EntityRule<T, OperationLocation, SynkApiCheckContext, A> {}

export class SnykApiCheckDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<OpenApiFact>[],
    private changelog: IChange<OpenApiFact>[],
    private currentJsonLike: OpenAPIV3.Document,
    private nextJsonLike: OpenAPIV3.Document,
    private providedContext: SynkApiCheckContext
  ) {}

  checkPromises() {
    return this.checks;
  }

  getContext(location: ILocation): OperationLocation & SynkApiCheckContext {
    return {
      ...(location.conceptualLocation as OperationLocation),
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
        OperationLocation,
        SynkApiCheckContext,
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

  get context() {
    const change: IChange<OpenApiFact> = {
      location: {
        conceptualLocation: { path: 'This Specification', method: '' },
        jsonPath: '/',
        conceptualPath: [],
        kind: 'API',
      },
    } as any;

    const value: ShouldOrMust<
      (
        context: SynkApiCheckContext,
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
            () => handler(this.providedContext, docsHelper)
          )
        );
      },
      // should: (statement, handler) => {
      //   const docsHelper = newDocsLinkHelper();
      //   this.checks.push(
      //     runCheck(
      //       change,
      //       docsHelper,
      //       'this specification: ',
      //       statement,
      //       false,
      //       () => handler(this.providedContext, docsHelper)
      //     )
      //   );
      // },
    };

    return value;
  }

  get specification() {
    const change: IChange<OpenApiFact> = {
      location: {
        conceptualLocation: { path: 'This Specification', method: '' },
        jsonPath: '/',
        conceptualPath: [],
        kind: 'API',
      },
    } as any;

    const value: ShouldOrMust<
      (
        document: OpenAPIV3.Document,
        context: SynkApiCheckContext,
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
      // should: (statement, handler) => {
      //   const docsHelper = newDocsLinkHelper();
      //   this.checks.push(
      //     runCheck(
      //       change,
      //       docsHelper,
      //       'this specification: ',
      //       statement,
      //       false,
      //       () => handler(this.nextJsonLike, this.providedContext, docsHelper)
      //     )
      //   );
      // },
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
        OperationLocation,
        SynkApiCheckContext,
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
        OperationLocation,
        SynkApiCheckContext,
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
      header: genericEntityRuleImpl<
        OpenApiRequestParameterFact,
        OperationLocation,
        SynkApiCheckContext,
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
    };
  }

  get responses() {
    const dsl = this;

    return {
      ...genericEntityRuleImpl<
        OpenApiResponseFact,
        OperationLocation,
        SynkApiCheckContext,
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
      headers: genericEntityRuleImpl<
        OpenApiHeaderFact,
        OperationLocation,
        SynkApiCheckContext,
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

  get checkApiContext(): ShouldOrMust<
    (context: SynkApiCheckContext, docs: DocsLinkHelper) => void
  > {
    const contextChangedHandler: (
      must: boolean
    ) => ContextChangedRule['must'] = (must: boolean) => {
      return (statement, handler) => {
        const docsHelper = newDocsLinkHelper();
        const syntheticChange: IChange<any> = {
          added: this.providedContext,
          changeType: ChangeType.Added,
          location: {
            jsonPath: '/',
            conceptualPath: [],
            conceptualLocation: {
              path: 'Entire Resource',
              method: '',
            },
            kind: 'ContextRule',
          } as any,
        };
        return runCheck(
          syntheticChange,
          docsHelper,
          'api lifeycle: ',
          statement,
          must,
          () => handler(this.providedContext, docsHelper)
        );
      };
    };

    return {
      must: contextChangedHandler(true),
      // should: contextChangedHandler(false),
    };
  }

  get bodyProperties(): SnykEntityRule<
    OpenApiFieldFact,
    OpenAPIV3.SchemaObject
  > {
    const dsl = this;
    return genericEntityRuleImpl<
      OpenApiFieldFact,
      OperationLocation,
      SynkApiCheckContext,
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

type ContextChangedRule = ShouldOrMust<
  (context: SynkApiCheckContext, docs: DocsLinkHelper) => void
>;
