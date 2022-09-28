import { Rule } from '../rules';
import { OpenApiKind, OpenAPIV3 } from '@useoptic/openapi-utilities';

export interface StandardBase {
  toRules(): Rule[];
  toMarkdown(): string;
  kind: OpenApiKind;
}
