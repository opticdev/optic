import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { hri } from 'human-readable-ids';

export const opticrcPath = path.resolve(os.homedir(), '.opticrc');

const getSourceFromEnv = () => process.env.__OPTIC_SOURCE || 'user';

export function defaultStorage(): IUserStorage {
  return {
    anonymousId: hri.random(),
    source: getSourceFromEnv(),
  };
}

export interface IUserStorage {
  idToken?: string;
  anonymousId: string;
  source: string;
}

export async function getCurrentStorage(): Promise<IUserStorage | undefined> {
  try {
    const storage: IUserStorage = await fs.readJSON(opticrcPath);
    return storage;
  } catch (e) {
    return undefined;
  }
}

async function getOrCreateKey<T extends keyof IUserStorage>(
  key: T,
  defaultValue: () => IUserStorage[T]
): Promise<IUserStorage[T]> {
  const storage = await getCurrentStorage();
  if (storage && storage[key]) {
    return storage[key];
  } else if (storage) {
    const storeValue = {
      ...storage,
      [key]: defaultValue(),
    };
    await fs.ensureFile(opticrcPath);
    await fs.writeFile(opticrcPath, JSON.stringify(storeValue));
    return storage[key];
  } else {
    const storeValue = {
      ...defaultStorage(),
      [key]: defaultValue(),
    };
    await fs.ensureFile(opticrcPath);
    await fs.writeFile(opticrcPath, JSON.stringify(storeValue));
    return storeValue[key];
  }
}

export function getOrCreateAnonId(): Promise<string> {
  return getOrCreateKey('anonymousId', hri.random);
}

export function getOrCreateSource(): Promise<string> {
  return getOrCreateKey('source', getSourceFromEnv);
}
