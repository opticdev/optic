import assert from "assert";
import { Traverse } from "../sdk/types";
import { SpecFrom } from "../pipeline/spec-from";
import { DSL } from "../sdk/types";
import { Newable } from "../types";
import { factsToChangelog } from "../sdk/facts-to-changelog";

export class CheckPipeline {
  private traverser: Newable<Traverse<any, any>> | null = null;
  private leftSpec: Promise<any> | null = null;
  private rightSpec: Promise<any> | null = null;
  private dsl: DSL | null = null;

  constructor() {}

  compareChangesIn(specSource: SpecFrom) {
    this.leftSpec = specSource();
    return { to: this.to.bind(this) };
  }

  to(specSource: SpecFrom) {
    this.rightSpec = specSource();
    return { withTraverser: this.withTraverser.bind(this) };
  }

  withTraverser<T extends Traverse<any, any>>(
    TraverserImpl: Newable<Traverse<any, any>>
  ) {
    this.traverser = TraverserImpl;
    return { withGuideFor: this.withGuideForFor.bind(this) };
  }

  withGuideForFor<T extends DSL>(
    DSLImpl: Newable<T>
  ): { guide: T; runCheck: () => void } {
    this.dsl = new DSLImpl();
    return { guide: this.dsl as T, runCheck: this.runCheck.bind(this) };
  }

  async runCheck() {
    assert(
      this.traverser && this.leftSpec && this.rightSpec && this.dsl,
      "dependencies missing. make sure to set two specs, a traverser and a guide before running"
    );

    const before = await this.leftSpec!;
    const after = await this.rightSpec!;

    const traverse = async (input: any) => {
      const traverser = new this.traverser!();
      traverser.traverse(await traverser.prepare(input));
      return traverser.accumulator;
    };

    const changelog = factsToChangelog(
      (await traverse(before)).allFacts(),
      (await traverse(after)).allFacts()
    );

    this.dsl!.run(changelog);

    return this.dsl!.results();
  }

  // withTraverser(traverser: Traverse<any, any>) {
  //   this.traverser = traverser
  // }
}

export function Check() {
  const pipeline = new CheckPipeline();
  return { compareChangesIn: pipeline.compareChangesIn.bind(pipeline) };
}
