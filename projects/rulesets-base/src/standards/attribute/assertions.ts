import { OpenAPIV3 } from '@useoptic/openapi-utilities';

type AttributeRuleDefinition<T, Context> = {
  ruleName: string;
  implemented: boolean;
} & (
  | {
      changed: {
        assertion: (before: T, after: T, context: Context) => void;
      };
    }
  | {
      always: {
        assertion: (value: T, context: Context) => void;
        extendSchema?: OpenAPIV3.SchemaObject;
      };
    }
);

export function requirement<T, Context>(
  must: string,
  assertion?: (value: T, context: Context) => void
): AttributeRuleDefinition<T, Context> {
  return {
    ruleName: must,
    implemented: !!assertion,
    always: {
      assertion: assertion ? assertion : () => {},
    },
  };
}

export function schemaRequirement<T, Context>(
  must: string,
  extendSchema?: OpenAPIV3.SchemaObject,
  additionalAssertion?: (value: T, context: Context) => void
): AttributeRuleDefinition<T, Context> {
  return {
    ruleName: must,
    implemented: Boolean(extendSchema || additionalAssertion),
    always: {
      extendSchema,
      assertion: () => {
        // logic to match extended schema
        // logic to run additional assertion
      },
    },
  };
}

export function changed<T, Context>(
  must: string,
  assertion?: (before: T, after: T, context: Context) => void
): AttributeRuleDefinition<T, Context> {
  return {
    ruleName: must,
    implemented: !!assertion,
    changed: {
      assertion: assertion ? assertion : () => {},
    },
  };
}

/////////////////////////////////////////////////////////////////////////////////

export type AttributeAssertions<T, Context> =
  | AttributeRuleDefinition<T, Context>
  | Array<AttributeRuleDefinition<T, Context>>;

// export function getAddedRules<T, Context>(
//   assertions: AttributeAssertions<T, Context>
// ) {
//   const asArray = Array.isArray(assertions) ? assertions : [assertions];
//   return asArray.filter((i) => i.apply === Applies.added && i.implemented);
// }
//
// export function getChangedRules<T, Context>(
//   assertions: AttributeAssertions<T, Context>
// ) {
//   const asArray = Array.isArray(assertions) ? assertions : [assertions];
//   return asArray.filter(
//     (i) => i.apply === Applies.changed && i.implemented
//   ) as (AttributeChanged<T, Context> & { implemented: true })[];
// }
// export function getRequirements<T, Context>(
//   assertions: AttributeAssertions<T, Context>
// ) {
//   const asArray = Array.isArray(assertions) ? assertions : [assertions];
//   return asArray.filter(
//     (i) => i.apply === Applies.requirement && i.implemented
//   ) as (AttributeRequirement<T, Context> & { implemented: true })[];
// }
