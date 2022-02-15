import { JsonPath } from '@useoptic/openapi-io';

export interface IShapeObservationResult {
  typesByPath: Map<JsonPath, IObservedTypes>;
}

export class ShapeObservationResult {
  static create(): IShapeObservationResult {
    return { typesByPath: new Map() };
  }

  static clone(self: IShapeObservationResult) {
    return { typesByPath: new Map(self.typesByPath) };
  }

  static entries(
    self: IShapeObservationResult
  ): IterableIterator<[JsonPath, IObservedTypes]> {
    return self.typesByPath.entries();
  }

  static paths(self: IShapeObservationResult): IterableIterator<JsonPath> {
    return self.typesByPath.keys();
  }

  static types(
    self: IShapeObservationResult
  ): IterableIterator<IObservedTypes> {
    return self.typesByPath.values();
  }

  static observe(
    self: IShapeObservationResult,
    observation: IObservedTypes
  ): IShapeObservationResult {
    const { path } = observation;
    const updated = ShapeObservationResult.clone(self);

    let existingObservation = updated.typesByPath[path];
    if (!existingObservation) {
      existingObservation = ObservedTypes.fromPath(path);
    }

    let unionedTypes = ObservedTypes.union(existingObservation, observation);
    updated.typesByPath.set(path, unionedTypes);

    return updated;
  }

  static union(
    self: IShapeObservationResult,
    newResult: IShapeObservationResult
  ): IShapeObservationResult {
    const updated = ShapeObservationResult.clone(self);

    for (let [path, newTypes] of ShapeObservationResult.entries(newResult)) {
      let existingTypes = self.typesByPath[path];
      if (!existingTypes) {
        existingTypes = ObservedTypes.fromPath(path);
      }

      let unionedTypes = ObservedTypes.union(existingTypes, newTypes);
      updated.typesByPath.set(path, unionedTypes);
    }

    return updated;
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

export class ObservedTypes {
  static fromPath(path: JsonPath) {
    return {
      path,
      types: [],
      propertySets: [],
    };
  }

  static union(
    observationA: IObservedTypes,
    observationB: IObservedTypes
  ): IObservedTypes {
    if (observationA.path !== observationB.path) {
      throw new Error('Cannot union observed types with different paths');
    }
    let path = observationA.path;

    let updatedTypes = new Set(observationA.types);
    for (let newType of observationB.types) {
      updatedTypes.add(newType);
    }

    let updatedPropertySets = [...observationA.propertySets];
    for (let propertySet of observationB.propertySets) {
      ObservedTypes.addPropertySet(updatedPropertySets, propertySet);
    }

    return {
      path,
      types: updatedTypes,
      propertySets: updatedPropertySets,
    };
  }

  static wasUnknown(observedTypes: IObservedTypes) {
    for (let _type of observedTypes.types) {
      return true;
    }
    return false;
  }

  static addPropertySet(existingSets: Set<string>[], newSet: Set<string>) {
    const exists = existingSets.some(
      (existingSet) => symmetricDifference(existingSet, newSet).size === 0
    );

    if (!exists) {
      existingSets.push(newSet);
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
