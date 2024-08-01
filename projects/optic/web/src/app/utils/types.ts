import type { RuleResult } from '@useoptic/openapi-utilities';
import type { OpticDiffs, WithOpticDiffs, od, or } from './changelog-tree';
import type { ojp } from './utils';

export const UnnamedPolymorphic = Symbol.for('unnamed_polymorphic');

// Types for internal spec format
export type InternalSpec = {
  metadata: InternalSpecMetadata;
  endpoints: WithOpticDiffs<Record<string, InternalSpecEndpoint>>;
};

export type InternalSpecMetadata = {
  version: string;
  servers: WithOpticDiffs<Record<string, Record<string, any>>>;
  info: WithOpticDiffs<Record<string, any>>;
  tags?: unknown;
  externalDocs?: unknown;
  security?: unknown;

  [ojp]: string;
  [od]?: OpticDiffs<any>;
  [or]?: RuleResult[];
  misc: WithOpticDiffs<Record<string, any>>;
};

export type InternalSpecEndpoint = {
  method: string;
  path: string;
  summary?: string;
  description?: string;

  // Keyed by parameter + location
  parameters: WithOpticDiffs<Record<string, InternalSpecParameter>>;
  requestBody?: InternalSpecRequestBody;
  responses: WithOpticDiffs<Record<string, InternalSpecResponse>>;

  [ojp]: string;
  [od]?: OpticDiffs<any>;
  [or]?: RuleResult[];
  misc: Record<string, any>;
};

export type InternalSpecRequestBody = {
  required: boolean;
  description?: string;
  content: WithOpticDiffs<InternalSpecContent>;

  [ojp]: string;
  [od]?: OpticDiffs<any>;
  [or]?: RuleResult[];
  misc: WithOpticDiffs<Record<string, any>>;
};

export type InternalSpecResponse = {
  description: string;
  content: WithOpticDiffs<InternalSpecContent>;
  headers: WithOpticDiffs<Record<string, InternalSpecParameter>>;

  [ojp]: string;
  [od]?: OpticDiffs<any>;
  [or]?: RuleResult[];
  misc: WithOpticDiffs<Record<string, any>>;
};

export type InternalSpecParameter = {
  name: string;
  in: string;
  required: boolean;
  description?: string;
  schema?: InternalSpecSchema;

  [ojp]: string;
  [od]?: OpticDiffs<any>;
  [or]?: RuleResult[];
  misc: WithOpticDiffs<Record<string, any>>;
};

// Keyed by content type -> body
export type InternalSpecContent = Record<string, InternalSpecSchema>;

export type InternalSpecObject = {
  type: 'object';
  value: 'object';
  properties: WithOpticDiffs<Record<string, InternalSpecSchemaField>>;
  additionalProperties?: boolean | InternalSpecSchema;
};

export type InternalSpecArray = {
  type: 'array';
  value: 'array';
  items: InternalSpecSchema;
};

export type InternalSpecPrimitive = {
  type: 'primitive';
  value: string; // e.g. boolean, string, number, null, etc
};

export type InternalSpecSchema = (
  | ({
      polymorphicKey: null;
    } & (InternalSpecObject | InternalSpecArray | InternalSpecPrimitive))
  | {
      polymorphicKey: string | typeof UnnamedPolymorphic; // e.g. oneOf, anyOf, typeArrays
      schemas: InternalSpecSchema[];
    }
) & {
  title?: string;
  description?: string;
  examples: any[];
  [ojp]: string;
  [od]?: OpticDiffs<any>;
  [or]?: RuleResult[];
  misc: WithOpticDiffs<Record<string, any>>;
};

export type InternalSpecSchemaField = InternalSpecSchema & {
  key: string;
  required: boolean;
};
