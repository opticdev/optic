import { ChangeType } from '<src>/types';
export type SpectacleChange = {
  added?: boolean;
  changed?: boolean;
  removed?: boolean;
};

export const convertSpectacleChangeToChangeType = (
  spectacleChange: SpectacleChange
): ChangeType | null =>
  spectacleChange.added
    ? 'added'
    : spectacleChange.changed
    ? 'updated'
    : spectacleChange.removed
    ? 'removed'
    : null;
