declare module 'human-readable-ids' {
  type ExportedRandom = {
    random: () => string;
  };
  export const hri = ExportedRandom;
  export const humanReadableIds = ExportedRandom;
}
