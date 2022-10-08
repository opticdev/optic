import { EntityBase } from './entity/base';
import { OpenApiKind } from '@useoptic/openapi-utilities';
import { Markdown } from './markdown/util';

export function ApiStandard(
  name: string,
  standards: EntityBase<any, any, any>[]
) {
  return {
    name,
    standards,
    toMarkdown: () => {
      return [
        Markdown.h1('Standard Operations'),
        Markdown.underlineBreak,
        standards
          .filter((i) => i.kind === OpenApiKind.Operation)
          .map((i) => i.toMarkdown().join(''))
          .join('\n'),

        Markdown.h1('Standard Responses\n'),
        Markdown.underlineBreak,
        standards
          .filter((i) => i.kind === OpenApiKind.Response)
          .map((i) => i.toMarkdown().join(''))
          .join('\n'),
        Markdown.h1('Schema Standards\n'),
        Markdown.underlineBreak,
        standards
          .filter((i) => i.kind === OpenApiKind.Field)
          .map((i) => i.toMarkdown().join(''))
          .join('\n'),
      ].join('');
    },
  };
}
