import { IFact, IChange, ChangeType } from './types';

import equals from 'fast-deep-equal';

const PATH_DELIMITER = '-=-';
type FactLookup = Map<string, IFact>;

const getConceptualPathIdentifier = (conceptualPath: string[]): string =>
  conceptualPath.join(PATH_DELIMITER);

export function factsToChangelog(past: IFact[], current: IFact[]): IChange[] {
  const pastFactsLookup: FactLookup = new Map();
  const currentFactsLookup: FactLookup = new Map();
  for (const fact of past) {
    pastFactsLookup.set(
      getConceptualPathIdentifier(fact.location.conceptualPath),
      fact
    );
  }
  for (const fact of current) {
    currentFactsLookup.set(
      getConceptualPathIdentifier(fact.location.conceptualPath),
      fact
    );
  }

  const added = current.filter(
    (currentFact) =>
      !pastFactsLookup.has(
        getConceptualPathIdentifier(currentFact.location.conceptualPath)
      )
  );
  const removed = past.filter(
    (pastFact) =>
      !currentFactsLookup.has(
        getConceptualPathIdentifier(pastFact.location.conceptualPath)
      )
  );

  const updated = past.filter((pastFact) => {
    const currentVersion = currentFactsLookup.get(
      getConceptualPathIdentifier(pastFact.location.conceptualPath)
    );
    return currentVersion
      ? !equals(pastFact.value, currentVersion.value)
      : false;
  });

  const addedChanges = added.map(
    (added) =>
      ({
        location: added.location,
        added: added.value,
        changeType: ChangeType.Added,
      }) as IChange
  );

  const removedChanges = removed.map(
    (removed) =>
      ({
        location: removed.location,
        removed: {
          before: removed.value,
        },
        changeType: ChangeType.Removed,
      }) as IChange
  );

  const changedChanges = updated.map((past) => {
    const after = currentFactsLookup.get(
      getConceptualPathIdentifier(past.location.conceptualPath)
    )!;

    return {
      location: past.location,
      changed: {
        before: past.value,
        after: after.value,
      },
      changeType: ChangeType.Changed,
    } as IChange;
  });

  return [...addedChanges, ...removedChanges, ...changedChanges];
}
