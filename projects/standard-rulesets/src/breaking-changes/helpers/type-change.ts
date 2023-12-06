import { OpenAPIV3, OpenAPIV3_1 } from '@useoptic/openapi-utilities';

type PropertyType = {
  required: boolean;
  schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
};

type BreakingChangeResult = {
  enum: string | false;
  typeChange: string | false;
  requiredChange: string | false;
};

export function computeTypeTransition(
  before: PropertyType,
  after: PropertyType
): {
  request: BreakingChangeResult;
  response: BreakingChangeResult;
} {
  const results: {
    request: BreakingChangeResult;
    response: BreakingChangeResult;
  } = {
    request: {
      enum: false,
      typeChange: false,
      requiredChange: false,
    },
    response: {
      enum: false,
      typeChange: false,
      requiredChange: false,
    },
  };

  // Check type change
  const typeChange = computeEffectiveTypeChange(
    before.schema.type,
    after.schema.type
  );
  const beforeType = Array.isArray(before.schema.type)
    ? `[${before.schema.type.join(',')}]`
    : before.schema.type;
  const afterType = Array.isArray(after.schema.type)
    ? `[${after.schema.type.join(',')}]`
    : after.schema.type;
  if (typeChange.expanded)
    results.request.typeChange = `type ${beforeType} was changed to ${afterType}`;
  if (typeChange.narrowed)
    results.response.typeChange = `type ${beforeType} was changed to ${afterType}`;

  // Check required changes
  if (before.required && !after.required) {
    results.response.requiredChange = `was made optional`;
  } else if (!before.required && after.required) {
    results.request.requiredChange = `was made required`;
  }

  // Check enum change
  const beforeEnum = Array.isArray(before.schema.enum)
    ? before.schema.enum
    : 'const' in before.schema
      ? [before.schema.const]
      : null;
  const afterEnum = Array.isArray(after.schema.enum)
    ? after.schema.enum
    : 'const' in after.schema
      ? [after.schema.const]
      : null;
  if (beforeEnum && afterEnum) {
    const enumResults = diffSets(new Set(beforeEnum), new Set(afterEnum));
    if (enumResults.beforeSetDiff.length)
      results.request.enum = `enums ${enumResults.beforeSetDiff.join(
        ','
      )} were added`;
    if (enumResults.afterSetDiff.length)
      results.response.enum = `enums ${enumResults.afterSetDiff.join(
        ','
      )} were removed`;
  } else if (beforeEnum && !afterEnum) {
    const keyword = 'const' in before.schema ? 'const' : 'enum';
    results.request.enum = `${keyword} keyword was removed`;
  } else if (!beforeEnum && afterEnum) {
    const keyword = 'const' in after.schema ? 'const' : 'enum';
    results.response.enum = `${keyword} keyword added`;
  }

  return results;
}

export function computeEffectiveTypeChange(
  beforeType: string | string[] | undefined,
  afterType: string | string[] | undefined
): {
  expanded: boolean;
  narrowed: boolean;
} {
  const before = typeToSet(beforeType);
  const after = typeToSet(afterType);
  const diff = diffSets(before, after);
  return {
    narrowed: diff.beforeSetDiff.length > 0,
    expanded: diff.afterSetDiff.length > 0,
  };
}

export function diffSets(
  beforeSet: Set<string>,
  afterSet: Set<string>
): { beforeSetDiff: string[]; afterSetDiff: string[] } {
  const beforeSetDiff = new Set([...beforeSet].filter((x) => !afterSet.has(x)));
  const afterSetDiff = new Set([...afterSet].filter((x) => !beforeSet.has(x)));

  return {
    afterSetDiff: [...afterSetDiff],
    beforeSetDiff: [...beforeSetDiff],
  };
}

function typeToSet(type?: string | string[]): Set<string> {
  if (Array.isArray(type)) {
    return new Set(type);
  } else if (typeof type === 'string') {
    return new Set([type]);
  } else {
    return new Set([]);
  }
}
