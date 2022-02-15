import { JsonPath } from '@useoptic/openapi-io';

export interface IShapeObservationResult {
  typesByPath: Map<JsonPath, IObservedTypes>;
}

export class ShapeObservationResult implements IShapeObservationResult {
  typesByPath: Map<JsonPath, IObservedTypes>;
  constructor() {
    this.typesByPath = new Map();
  }

  entries(): IterableIterator<[JsonPath, IObservedTypes]> {
    return this.typesByPath.entries();
  }

  paths(): IterableIterator<JsonPath> {
    return this.typesByPath.keys();
  }

  types(): IterableIterator<IObservedTypes> {
    return this.typesByPath.values();
  }

  union(newResult: ShapeObservationResult) {
    for (let [path, newTypes] of newResult.entries()) {
      let existingTypes = this.typesByPath[path];
      if (!existingTypes) {
        this.typesByPath[path] = existingTypes = new ObservedTypes(path);
      }

      existingTypes.union(newTypes);
    }
  }
}

export enum ObservableJsonTypes {
  Array = 'array',
  Boolean = 'boolean',
  EmptyArray = 'emtpy-array',
  Number = 'number',
  Null = 'null',
  Object = 'object',
  String = 'string',
}

export interface IObservedTypes {
  path: JsonPath;
  types: Iterable<ObservableJsonTypes>;

  propertySets: Set<string>[];
}

export class ObservedTypes implements IObservedTypes {
  types: Set<ObservableJsonTypes>;
  propertySets: Set<string>[] = [];

  constructor(public path: JsonPath) {
    this.types = new Set();
  }

  union(newObservation: ObservedTypes) {
    for (let newType of newObservation.types) {
      this.types.add(newType);
    }

    for (let propertySet of newObservation.propertySets) {
      this.addPropertySet(propertySet);
    }
  }

  wasUnknown() {
    return this.types.size === 0;
  }

  addPropertySet(newSet: Set<string>) {
    const exists = this.propertySets.some(
      (existingSet) => symmetricDifference(existingSet, newSet).size === 0
    );

    if (!exists) {
      this.propertySets.push(newSet);
    }
  }
}

function symmetricDifference<T>(a: Set<T>, b: Set<T>) {
  let diff = new Set(a);
  for (let elem of b) {
    if (diff.has(elem)) {
      diff.delete(elem);
    } else {
      diff.add(elem);
    }
  }
  return diff;
}
