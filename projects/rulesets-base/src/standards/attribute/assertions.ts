export enum Applies {
  'requirement',
  'changed',
  'added',
  'removed',
}

export interface AttributeRule<T, Context> {
  apply: Applies;
  implemented: boolean;
  ruleName: string;
}

export interface AttributeRequirement<T, Context>
  extends AttributeRule<T, Context> {
  ruleName: string;
  apply: Applies.requirement;
  assertion: (value: T, context: Context) => void;
}

export function requirement<T, Context>(
  must: string,
  assertion?: (value: T, context: Context) => void
): AttributeRequirement<T, Context> {
  return {
    ruleName: must,
    implemented: !!assertion,
    assertion: assertion ? assertion : () => {},
    apply: Applies.requirement,
  };
}

export interface AttributeChanged<T, Context>
  extends AttributeRule<T, Context> {
  ruleName: string;
  apply: Applies.changed;
  assertion: (before: T, after: T, context: Context) => void;
}

export function changed<T, Context>(
  must: string,
  assertion?: (before: T, after: T, context: Context) => void
): AttributeChanged<T, Context> {
  return {
    ruleName: must,
    implemented: !!assertion,
    assertion: assertion ? assertion : () => {},
    apply: Applies.changed,
  };
}

/////////////////////////////////////////////////////////////////////////////////

export type AttributeAssertions<T, Context> =
  | AttributeRule<T, Context>
  | AttributeRule<T, Context>[];

export function getAddedRules<T, Context>(
  assertions: AttributeAssertions<T, Context>
) {
  const asArray = Array.isArray(assertions) ? assertions : [assertions];
  return asArray.filter((i) => i.apply === Applies.added && i.implemented);
}

export function getChangedRules<T, Context>(
  assertions: AttributeAssertions<T, Context>
) {
  const asArray = Array.isArray(assertions) ? assertions : [assertions];
  return asArray.filter(
    (i) => i.apply === Applies.changed && i.implemented
  ) as AttributeChanged<T, Context>[];
}
export function getRequirements<T, Context>(
  assertions: AttributeAssertions<T, Context>
) {
  const asArray = Array.isArray(assertions) ? assertions : [assertions];
  return asArray.filter(
    (i) => i.apply === Applies.requirement && i.implemented
  ) as (AttributeRequirement<T, Context> & { implemented: true })[];
}
