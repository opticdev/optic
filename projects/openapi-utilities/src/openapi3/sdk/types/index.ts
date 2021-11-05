import { ConceptualLocation } from "../../implementations/openapi3/openapi-traverser";
export class FactAccumulator<KindSchema> {
  constructor(private facts: IFact<KindSchema>[]) {}
  log(fact: IFact<KindSchema>) {
    this.facts.push(fact);
  }

  allFacts() {
    return this.facts;
  }
}

export interface Traverse<DocSchema, FactSchema> {
  format: string;
  traverse(input: DocSchema): void;
  accumulator: FactAccumulator<FactSchema>;
}

export interface IFact<KindSchema> {
  location: ILocation;
  value: KindSchema;
}

export type IPathComponent = string | number;
export type I = string | number;

enum IChangeType {
  Added,
  Removed,
  Changed,
}

export interface ILocation {
  jsonPath: string;
  conceptualPath: IPathComponent[];
  conceptualLocation: ConceptualLocation;
  kind: string;
}

export interface IChange<T> {
  location: ILocation;
  added?: T;
  changed?: {
    before: T;
    after: T;
  };
  removed?: {
    before: T;
  };
}
