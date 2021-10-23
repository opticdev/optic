import fs from "fs-extra";

export type SpecFrom = () => Promise<any>;

export const jsonFromFile = (path: string) => async () => {
  const bytes = await fs.readJson(path)
  return bytes;
};
