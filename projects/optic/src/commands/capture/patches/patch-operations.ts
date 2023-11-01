import { Operation as PatchOperation } from 'fast-json-patch';

export type { PatchOperation };

export enum PatchImpact {
  BackwardsCompatible = 'BackwardsCompatible',
  BackwardsIncompatible = 'BackwardsIncompatible',
  BackwardsCompatibilityUnknown = 'BackwardsCompatibilityUnknown',
  Addition = 'Addition',
  Refactor = 'Refactor',
}
