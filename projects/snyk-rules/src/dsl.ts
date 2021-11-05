import { ApiCheckDsl, EntityRule, Result } from "@useoptic/api-checks";
import {
  ConceptualLocation,
  OpenApiHeaderFact,
  OpenApiKind,
  OpenApiOperationFact,
  IChange,
  IFact,
  OpenApiFieldFact,
  ILocation,
} from "@useoptic/openapi-utilities";
import { genericEntityRuleImpl } from "@useoptic/api-checks/build/sdk/generic-entity-rule-impl";

type SnykStablity = "wip" | "experimental" | "beta" | "ga";
type DateString = string; // YYYY-mm-dd
type ResourceName = string;

export interface SynkApiCheckContext {
  // Vervet provides context about the change itself. Since
  // Optic is analyzing two OpenAPI spec files, we need to tell it
  // when the change is supposed to happen, and the resource/version info
  // determined by the file's location in a directory structure.
  changeDate: DateString; // when the change did (or would, if proposed) occur
  changeResource: ResourceName; // the spec resource being changed
  changeVersion: {
    // the spec version being changed
    date: DateString;
    stability: SnykStablity;
  };

  // Vervet provides a mapping that indicates the resource version deprecation.
  // It has this information because it processes the entire source tree of
  // spec files.
  resourceVersions: {
    [ResourceName: string]: {
      // changeResource used to match this
      [DateString: string]: {
        // changeVersion.date used to match this
        [SnykStablity: string]: {
          // changeVersion.stability matches this
          deprecatedBy: {
            // the spec version that deprecates this one (if any) or null
            date: DateString;
            stability: SnykStablity; // could be higher stability than changed!
          } | null;
        };
      };
    };
  };
}

export interface SnykEntityRule<T>
  extends EntityRule<T, ConceptualLocation, SynkApiCheckContext> {}

export interface ISnykApiCheckDsl extends ApiCheckDsl {
  operations: SnykEntityRule<OpenApiOperationFact>;
}

export class SnykApiCheckDsl implements ISnykApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private changelog: IChange<any>[],
    private context: SynkApiCheckContext
  ) {}

  checkPromises() {
    return this.checks;
  }

  getContext(location: ILocation): ConceptualLocation & SynkApiCheckContext {
    return {
      ...location.conceptualLocation,
      ...this.context,
    };
  }

  get operations() {
    return genericEntityRuleImpl<
      OpenApiOperationFact,
      ConceptualLocation,
      SynkApiCheckContext
    >(
      OpenApiKind.Operation,
      this.changelog,
      this.nextFacts,
      (opFact) => `${opFact.method.toUpperCase()} ${opFact.pathPattern}`,
      (location) => this.getContext(location),
      (...items) => this.checks.push(...items)
    );
  }

  get headers(): SnykEntityRule<OpenApiHeaderFact> {
    return genericEntityRuleImpl<
      OpenApiHeaderFact,
      ConceptualLocation,
      SynkApiCheckContext
    >(
      OpenApiKind.HeaderParameter,
      this.changelog,
      this.nextFacts,
      (header) => `header ${header.name}`,
      (location) => this.getContext(location),
      (...items) => this.checks.push(...items)
    );
  }

  get bodyProperties(): SnykEntityRule<OpenApiFieldFact> {
    return genericEntityRuleImpl<
      OpenApiFieldFact,
      ConceptualLocation,
      SynkApiCheckContext
    >(
      OpenApiKind.Field,
      this.changelog,
      this.nextFacts,
      (field) => `field ${field.name}`,
      (location) => this.getContext(location),
      (...items) => this.checks.push(...items)
    );
  }
}
