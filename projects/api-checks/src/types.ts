import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";

export interface ShouldOrMust<G> {
  must: G;
  should: G;
}

export interface Result {
  where: string;
  condition: string;
  isMust: boolean;
  isShould: boolean;
  error?: string;
  passed: boolean;
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
    };
  } catch (e: any) {
    return {
      passed: false,
      condition,
      where,
      isMust: must,
      isShould: !must,
      error: e.message,
    };
  }
}

export interface ApiCheckDsl {
  run: (facts: IFact<any>[], changelog: IChange[]) => Promise<Result[]>;
}
