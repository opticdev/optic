import { IChange, ChangeType } from '@useoptic/openapi-utilities';

type Exemption = string | string[] | undefined;

const normalizeExemption = (exemption: Exemption): string[] =>
  typeof exemption === 'string'
    ? [exemption]
    : Array.isArray(exemption)
    ? exemption
    : [];

const numberOfExemptionsAdded = (exBefore: Exemption, exAfter: Exemption) => {
  const exBeforeNormalized = normalizeExemption(exBefore);
  const exAfterNormalized = normalizeExemption(exAfter);
  return exAfterNormalized.filter((e) => !exBeforeNormalized.includes(e))
    .length;
};

export const newExemptionsCount = (change: IChange) => {
  const exemptionsKey = 'x-optic-exemptions';
  if (change.changeType === ChangeType.Added) {
    return numberOfExemptionsAdded(undefined, change.added[exemptionsKey]);
  } else if (change.changeType === ChangeType.Changed) {
    const exemptionsBefore = change.changed.before[exemptionsKey];
    const exemptionsAfter = change.changed.after[exemptionsKey];
    return numberOfExemptionsAdded(exemptionsBefore, exemptionsAfter);
  }
  return 0;
};
