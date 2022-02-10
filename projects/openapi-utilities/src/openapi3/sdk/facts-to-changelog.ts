import { IFact, IChange, OpenApiFact, ChangeType } from './types';

import equals from 'fast-deep-equal';

export function factsToChangelog(
  past: IFact<OpenApiFact>[],
  current: IFact<OpenApiFact>[]
): IChange<OpenApiFact>[] {
  const added = current.filter(
    (i) =>
      !past.some((fact) =>
        equals(fact.location.conceptualPath, i.location.conceptualPath)
      )
  );
  const removed = past.filter(
    (i) =>
      !current.some((fact) =>
        equals(fact.location.conceptualPath, i.location.conceptualPath)
      )
  );
  const updated = past.filter((i) => {
    const currentVersion = current.find((fact) =>
      equals(fact.location.conceptualPath, i.location.conceptualPath)
    );
    if (currentVersion) {
      if (equals(i.value, currentVersion.value)) {
        return false;
      } else return true;
    } else return false;
  });

  const addedChanges: IChange<OpenApiFact>[] = added.map((added) => ({
    location: added.location,
    added: added.value,
    changeType: ChangeType.Added,
  }));

  const removedChanges: IChange<OpenApiFact>[] = removed.map((removed) => ({
    location: removed.location,
    removed: {
      before: removed.value,
    },
    changeType: ChangeType.Removed,
  }));

  const changedChanges: IChange<OpenApiFact>[] = updated.map((past) => {
    const after = current.find((fact) =>
      equals(fact.location.conceptualPath, past.location.conceptualPath)
    )!;
    return {
      location: past.location,
      changed: {
        before: past.value,
        after: after.value,
      },
      changeType: ChangeType.Changed,
    };
  });

  return [...addedChanges, ...removedChanges, ...changedChanges];
}
