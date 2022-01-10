import { OpenApiFact, IChange } from './openapi3/sdk/types';

// API check results and sourcemaps
export type ILookupLinePreviewResult =
  | undefined
  | {
      endLine: number;
      endPosition: number;
      filePath: string;
      startLine: number;
      preview: string;
      startPosition: number;
    };

export interface ShouldOrMust<G> {
  must: (statement: string, handler: G) => void;
}

export type StructuralContext = {
  directParentAdded: boolean;
  operationAdded: boolean;
  bodyAdded: boolean;
  responseAdded: boolean;
  isInRequest: boolean;
  isInResponse: boolean;
};

type DocsMetadata = Omit<DocsLinkHelper, 'docsLink' | 'effectiveOn'>;

export interface EntityRule<G, ApiContext, DSLContext, OpenApiEntityType> {
  added: ShouldOrMust<
    (
      added: G,
      context: ApiContext & DSLContext & StructuralContext,
      docs: DocsMetadata,
      specItem: OpenApiEntityType
    ) => Promise<void> | void
  >;
  changed: ShouldOrMust<
    (
      before: G,
      after: G,
      context: ApiContext & DSLContext & StructuralContext,
      docs: DocsMetadata,
      specItem: OpenApiEntityType
    ) => Promise<void> | void
  > & {
    attributes: (
      limitToKey: string,
      ...andKeys: string[]
    ) => ShouldOrMust<
      (
        before: G,
        after: G,
        context: ApiContext & DSLContext & StructuralContext,
        docs: DocsMetadata,
        specItem: OpenApiEntityType
      ) => Promise<void> | void
    >;
  };
  requirementOnChange: ShouldOrMust<
    (
      addedOrAfter: G,
      context: ApiContext & DSLContext & StructuralContext,
      docs: DocsMetadata,
      specItem: OpenApiEntityType
    ) => Promise<void> | void
  > & {
    attributes: (
      limitToKey: string,
      ...andKeys: string[]
    ) => ShouldOrMust<
      (
        addedOrAfter: G,
        context: ApiContext & DSLContext & StructuralContext,
        docs: DocsMetadata,
        specItem: OpenApiEntityType
      ) => Promise<void> | void
    >;
  };
  removed: ShouldOrMust<
    (
      before: G,
      context: ApiContext & DSLContext & StructuralContext,
      docs: DocsMetadata
    ) => Promise<void> | void
  >;
  requirement: ShouldOrMust<
    (
      value: G,
      context: ApiContext & DSLContext & StructuralContext,
      docs: DocsMetadata,
      specItem: OpenApiEntityType
    ) => Promise<void> | void
  >;
}

export interface Result {
  where: string;
  condition: string;
  isMust: boolean;
  isShould: boolean;
  error?: string;
  passed: boolean;
  change: IChange<OpenApiFact>;
  docsLink?: string;
  effectiveOnDate?: Date;
}

export type ResultWithSourcemap = Result & {
  sourcemap: ILookupLinePreviewResult;
};

export interface Passed extends Result {
  passed: true;
  error: undefined;
}
export interface Failed extends Result {
  passed: false;
  error: string;
}

export type DocsLinkHelper = {
  docsLink: string | undefined;
  effectiveOn: Date | undefined;
  includeDocsLink: (link: string) => void;
  becomesEffectiveOn: (date: Date) => void;
};

export interface ApiCheckDsl {
  checkPromises: () => Promise<Result>[];
}
