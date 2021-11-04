import { ConceptualLocation } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/openapi-traverser";
import { IChange } from "@useoptic/openapi-utilities/build/openapi3/sdk/types";

export interface ShouldOrMust<G> {
  must: (statement: string, handler: G) => void;
  should: (statement: string, handler: G) => void;
}

export interface EntityRule<G, ApiContext, DSLContext> {
  added: ShouldOrMust<
    (added: G, context: ApiContext & DSLContext) => Promise<void> | void
  >;
  changed: ShouldOrMust<
    (
      before: G,
      after: G,
      context: ApiContext & DSLContext
    ) => Promise<void> | void
  >;
  requirement: ShouldOrMust<
    (value: G, context: ApiContext & DSLContext) => Promise<void> | void
  >;
}

export interface Result {
  where: string;
  condition: string;
  isMust: boolean;
  isShould: boolean;
  error?: string;
  passed: boolean;
  change: IChange<any>;
}

export interface Passed extends Result {
  passed: true;
  error: undefined;
}
export interface Failed extends Result {
  passed: false;
  error: string;
}

export async function runCheck(
  change: IChange<any>,
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
    };
  }
}

export interface ApiCheckDsl {
  checkPromises: () => Promise<Result>[];
}
