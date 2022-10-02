import { OpenApiOperationFact } from '@useoptic/openapi-utilities';

export type PathRules = `id:${string}` | string;

type UrlMatcherPredicate = (
  url: string,
  context: {
    operation: OpenApiOperationFact;
    lifecycle?: 'added' | 'removed' | 'changed';
  }
) => boolean;

function random() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(2, 10);
}
class ApiPathMatcher {
  private map: { [key: string]: UrlMatcherPredicate } = {};

  filter(predicate: (url: string) => boolean): string {
    const id = `id:${random()}`;
    this.map[id] = predicate;
    return id;
  }

  __lookupPredicate(id: string): UrlMatcherPredicate | undefined {
    return this.map[id];
  }
}

export const Paths = new ApiPathMatcher();
