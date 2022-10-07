import {
  FactVariant,
  IChange,
  IFact,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { MarkdownSequence } from '../markdown/util';
import JsonPointerHelpers from '@useoptic/json-pointer-helpers/build/json-pointers/json-pointer-helpers';

export class EntityBase<OpenAPIType, Context, Fact extends OpenApiKind> {
  createContext(
    fact: FactVariant<Fact>,
    lifeCycle: 'added' | 'removed' | 'continuous',
    inputs: RunnerEntityInputs
  ): Context {
    throw new Error('create context not implemented');
  }

  toMarkdown(): MarkdownSequence {
    return [''];
  }

  run(input: RunnerEntityInputs) {
    throw new Error('');
  }
}

export type RunnerEntityInputs = {
  beforeSpec: OpenAPIV3.Document;
  afterSpec: OpenAPIV3.Document;
  beforeFacts: IFact[];
  afterFacts: IFact[];
  changelog: IChange[];
};

export type CollectedInputs<Fact extends OpenApiKind> = {
  added: FactVariant<Fact>[];
  removed: FactVariant<Fact>[];
  continuous: { before: FactVariant<Fact>; after: FactVariant<Fact> }[];
};

export type QualifiedInputs<OpenAPIType, Fact extends OpenApiKind> = {
  added: { spec: OpenAPIType; fact: FactVariant<Fact> }[];
  removed: { spec: OpenAPIType; fact: FactVariant<Fact> }[];
  continuous: {
    before: { fact: FactVariant<Fact>; spec: OpenAPIType };
    after: { fact: FactVariant<Fact>; spec: OpenAPIType };
  }[];
};
