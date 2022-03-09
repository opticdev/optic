import { ObservedSpecPatchGenerator } from '../patches';

export interface SpecTemplate<T> {
  name: string;
  patchGenerator: ObservedSpecPatchGenerator<T>;
}

export class SpecTemplate<T> {
  static create<T>(
    name,
    patchGenerator: ObservedSpecPatchGenerator<T>
  ): SpecTemplate<T> {
    return { name, patchGenerator };
  }
}
