import {
  OpenApiFact,
  IChange,
  Result,
  DocsLinkHelper,
} from '@useoptic/openapi-utilities';

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
  change: IChange<OpenApiFact>,
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
