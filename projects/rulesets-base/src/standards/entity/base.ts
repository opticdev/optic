import {
  IChange,
  IFact,
  OpenApiOperationFact,
} from '@useoptic/openapi-utilities';
import { MarkdownSequence } from '../markdown/util';

export class EntityBase<OpenAPIType, Context, Fact> {
  collect(inputs: RunnerEntityInputs): CollectedInputs<Fact> {
    throw new Error('collect not implemented');
  }
  qualify(inputs: CollectedInputs<Fact>): string[] {
    throw new Error('qualify not implemented');
  }

  toMarkdown(): MarkdownSequence {
    return [''];
  }

  // runWithInputs(inputs: RunnerEntityInputs) {
  //   const rulesToRun = this.qualify(this.collect(inputs));
  // }
}

export type RunnerEntityInputs = {
  beforeFacts: IFact[];
  afterFacts: IFact[];
  changelog: IChange[];
};

export type CollectedInputs<Fact> = {
  added: Fact[];
  removed: Fact[];
  continuous: { before: Fact; after: Fact }[];
};
