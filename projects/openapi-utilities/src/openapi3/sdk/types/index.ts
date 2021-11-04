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
  jsonPath: IPathComponent[];
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
  removed?: boolean;
}

export interface ICheckResult {
  isIssue: boolean;
  isWarning: boolean;
}

export interface IWarning extends ICheckResult {
  message: string;
  location?: ILocation;
  isIssue: false;
  isWarning: true;
}

export interface IIssue extends ICheckResult {
  message: string;
  location?: ILocation;
  isIssue: true;
  isWarning: false;
}

export function Warning(message: string): IWarning {
  return { message, isWarning: true, isIssue: false };
}
export function Issue(message: string): IIssue {
  return { message, isIssue: true, isWarning: false };
}

export type ReportFromHandler = (
  report: IWarning | IIssue | IWarning[] | IIssue[],
  location?: ILocation
) => void;

export type AddedHandler<A, B> = (
  node: A,
  context: B,
  location: ILocation,
  report: ReportFromHandler
) => void;

export type AlwaysHandler<A, B> = (
  node: A,
  context: B,
  location: ILocation,
  report: ReportFromHandler
) => void;
export type ChangedHandler<A, B> = (
  last: A,
  current: A,
  context: B,
  location: ILocation,
  report: ReportFromHandler
) => void;
export type RemovedHandler<A, B> = (
  context: B,
  location: ILocation,
  report: ReportFromHandler
) => void;
