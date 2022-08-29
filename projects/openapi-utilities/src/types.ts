import { IChange, IFact } from './openapi3/sdk/types';

export type LookupLineResult = {
  endLine: number;
  endPosition: number;
  startLine: number;
  startPosition: number;
};

export type LookupLineResultWithFilepath = LookupLineResult & {
  filePath: string;
};


export interface ShouldOrMust<G> {
  must: (statement: string, handler: G) => void;
  // should: (statement: string, handler: G) => void;
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
  error?: string;
  passed: boolean;
  exempted?: boolean;
  change: IChange | IFact; // IFact for `requirement`
  docsLink?: string;
  // new
  name?: string;
  expected?: string; // JSON string values
  received?: string; // JSON string values
  type?: 'requirement' | 'added' | 'changed' | 'removed';

  // to deprecate
  condition?: string;
  effectiveOnDate?: Date;
  isShould: boolean;
  isMust: boolean;
}

export type ResultWithSourcemap = Result & {
  sourcemap?: LookupLineResultWithFilepath;
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

export function newDocsLinkHelper(): DocsLinkHelper {
  let docsLink: string | undefined = undefined;
  let effectiveOn: Date | undefined = undefined;

  return {
    includeDocsLink: (link: string) => (docsLink = link),
    becomesEffectiveOn: (date: Date) => (effectiveOn = date),
    get docsLink() {
      return docsLink;
    },
    get effectiveOn() {
      return effectiveOn;
    },
  };
}

export async function runCheck(
  change: IChange,
  docsLink: DocsLinkHelper,
  where: string,
  condition: string,
  must: boolean,
  handler: (() => void) | (() => Promise<void>)
): Promise<Result> {
  try {
    await handler();
    return {
      passed: true,
      condition,
      where,
      isMust: must,
      isShould: !must,
      change,
      docsLink: docsLink.docsLink,
      effectiveOnDate: docsLink.effectiveOn,
    };
  } catch (e: any) {
    return {
      passed: false,
      condition,
      where,
      isMust: must,
      isShould: !must,
      error: e.message,
      change,
      docsLink: docsLink.docsLink,
      effectiveOnDate: docsLink.effectiveOn,
    };
  }
}

export interface ApiCheckDsl {
  checkPromises: () => Promise<Result>[];
}
