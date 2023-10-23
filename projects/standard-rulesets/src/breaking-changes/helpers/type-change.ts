import { OpenAPIV3, OpenAPIV3_1 } from '@useoptic/openapi-utilities';

type PropertyType = {
  required: boolean;
  schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
};

type BreakingChangeResult = {
  enum: boolean;
  typeChange: boolean;
  requiredChange: boolean;
};

export function computeTypeTransition(
  before: PropertyType,
  after: PropertyType
): {
  expanded: BreakingChangeResult;
  narrowed: BreakingChangeResult;
} {
  const results: {
    expanded: BreakingChangeResult;
    narrowed: BreakingChangeResult;
  } = {
    expanded: {
      enum: false,
      typeChange: false,
      requiredChange: false,
    },
    narrowed: {
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
  if (typeChange.expanded) results.expanded.typeChange = true;
  if (typeChange.narrowed) results.narrowed.typeChange = true;

  // Check required changes
  if (before.required && !after.required) {
    results.narrowed.requiredChange = true;
  } else if (!before.required && after.required) {
    results.expanded.requiredChange = true;
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
    if (enumResults.expanded.length) results.expanded.enum = true;
    if (enumResults.narrowed.length) results.narrowed.enum = true;
  } else if (beforeEnum && !afterEnum) {
    results.expanded.enum = true;
  } else if (!beforeEnum && afterEnum) {
    results.narrowed.enum = true;
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
    narrowed: diff.narrowed.length > 0,
    expanded: diff.expanded.length > 0,
  };
}

export function diffSets(
  beforeSet: Set<string>,
  afterSet: Set<string>
): { expanded: string[]; narrowed: string[] } {
  const narrowedSet = new Set([...beforeSet].filter((x) => !afterSet.has(x)));
  const expandedSet = new Set([...afterSet].filter((x) => !beforeSet.has(x)));

  return {
    expanded: [...expandedSet],
    narrowed: [...narrowedSet],
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
