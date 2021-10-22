
export class FactAccumulator<KindSchema> {
  constructor(private facts: IFact<KindSchema>[]) {
  }
  log(fact: IFact<KindSchema>) {
    this.facts.push(fact)
  }

  allFacts() {
    return this.facts
  }

}

export interface Traverse<DocSchema, FactSchema> {
  format: string
  prepare(input: any): Promise<DocSchema>
  traverse(input: DocSchema): void
  accumulator: FactAccumulator<FactSchema>
}

export interface IFact<KindSchema> {
  location: {
    jsonPath: IPathComponent[]
    conceptualPath: IPathComponent[]
    stableId?: string
    kind: string
  }
  value: KindSchema
}

export type IPathComponent = string | number
export type I = string | number

enum IChangeType {
  Added, Removed, Changed
}

export interface ILocation {
    jsonPath: IPathComponent[]
    conceptualPath: IPathComponent[]
    stableId?: string
    kind: string
}

export interface IChange {
  location: ILocation
  added?: any;
  changed?: {
    before: any;
    after: any;
  }
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

export class DSL {
  private issues: IIssue[] = [];
  private warnings: IWarning[] = [];

  reset() {
    this.issues = [];
    this.warnings = [];
  }

  report: ReportFromHandler = (input, location?: ILocation) => {
    if (Array.isArray(input) && input.length > 0 && input[0].isIssue) {
      this.issues = [
        ...this.issues,
        ...(input as IIssue[]).map((i) => ({ ...i, location })),
      ];
    } else if (Array.isArray(input) && input.length > 0 && input[0].isWarning) {
      this.warnings = [
        ...this.warnings,
        ...(input as IWarning[]).map((i) => ({ ...i, location })),
      ];
    } else if (!Array.isArray(input)) {
      if ((input as ICheckResult).isIssue) {
        this.issues.push({ ...(input as IIssue), location });
      } else if ((input as ICheckResult).isWarning) {
        this.warnings.push({ ...(input as IWarning), location });
      }
    }
  };
  constructor() {}

  toHumanReadableChange(change: IChange): string | undefined {
    return undefined;
  }
  run(changes: IChange[]): void {
    this.reset();
  }

  results() {
    return {
      warnings: this.warnings,
      issues: this.issues,
    };
  }

  uses(attach: (guide: DSL) => void) {
    attach(this);
  }
}

export type ComposableGuide = (guide: any) => void;
