import { IFact } from "./types";
import { IChange } from "./types";

import equals from "fast-deep-equal";

export function factsToChangelog(
  past: IFact<any>[],
  current: IFact<any>[]
): IChange<any>[] {
  const added = current.filter(
    (i) => !past.some((fact) => equals(fact.location.conceptualPath, i.location.conceptualPath))
  );
  const removed = past.filter(
    (i) => !current.some((fact) => equals(fact.location.conceptualPath, i.location.conceptualPath))
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

  return [
    ...added.map((added) => ({
      location: added.location,
      added: added.value,
    })),
    ...removed.map((added) => ({
      location: added.location,
      removed: true,
    })),
    ...updated.map((past) => {
      const after = current.find((fact) =>
        equals(fact.location.conceptualPath, past.location.conceptualPath)
      )!;
      return {
        location: past.location,
        changed: {
          before: past.value,
          after: after.value,
        },
      };
    }),
  ];
}
