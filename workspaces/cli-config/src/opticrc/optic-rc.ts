import fs from 'fs-extra';
import path from 'path';
import os from 'os';
//@ts-ignore
import { hri } from 'human-readable-ids';
//@ts-ignore
import niceTry from 'nice-try';

export const opticrcPath = path.resolve(os.homedir(), '.opticrc');

export function defaultStorage(): IUserStorage {
  return {
    idToken: undefined,
    anonymousId: hri.random(),
  };
}

export interface IUserStorage {
  idToken?: string;
  anonymousId: string;
}

export async function getCurrentStorage(): Promise<IUserStorage | undefined> {
  try {
    const storage: IUserStorage = await fs.readJSON(opticrcPath);
    return storage;
  } catch (e) {
    return undefined;
  }
}

export async function getOrCreateAnonId(): Promise<string> {
  const storage: IUserStorage | undefined = await getCurrentStorage();

  if (storage && storage.anonymousId) {
    return storage.anonymousId;
  } else if (storage) {
    const storeValue = {
      ...storage,
      anonymousId: hri.random(),
    };
    await fs.ensureFile(opticrcPath);
    await fs.writeFile(opticrcPath, JSON.stringify(storeValue));
    return storeValue.anonymousId;
  } else {
    const storeValue = defaultStorage();
    await fs.ensureFile(opticrcPath);
    await fs.writeFile(opticrcPath, JSON.stringify(storeValue));
    return storeValue.anonymousId;
  }
}
