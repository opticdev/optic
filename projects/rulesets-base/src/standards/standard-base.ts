import { Rule } from '../rules';
import { OpenApiKind, OpenAPIV3 } from '@useoptic/openapi-utilities';

export interface StandardBase {
  toRules(): Rule[];
  toMarkdown(indent?: number): string;
  kind: OpenApiKind;
}

/*
 * Parameters
 *
 *  */
function QueryParameter(options: { name?: string }): StandardBase & {} {
  return {
    kind: OpenApiKind.QueryParameter,
    toRules: () => {
      return [];
    },
    toMarkdown: () => ``,
  };
}

function HeaderParameter(): StandardBase & {} {
  return {
    kind: OpenApiKind.HeaderParameter,
    toRules: () => {
      return [];
    },
    toMarkdown: () => ``,
  };
}

// function PathParameter(): StandardBase & {} {
//   return {
//     toRules: () => {
//       return [];
//     },
//     toMarkdown: () => ``,
//   };
// }

/*
 * Parameters
 *
 *  */
