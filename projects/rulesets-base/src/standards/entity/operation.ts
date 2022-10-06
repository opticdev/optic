import { AttributeAssertions } from '../attribute/assertions';
import {
  ChangeVariant,
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { Matcher, matches } from '../runner/matcher';
import { ParameterStandard, ParameterStandardRunner } from './parameter';
import { ResponseStandard, ResponseStandardRunner } from './response';
import { EntityBase, RunnerEntityInputs } from './base';
import { Markdown, MarkdownSequence, renderAttributes } from '../markdown/util';

export type OperationContext = {
  pathPattern: string;
  lifecycle: 'added' | 'removed' | 'continuous';
  method: OpenAPIV3.HttpMethods;
};

export interface OperationStandard {
  summary?: AttributeAssertions<string | undefined, OperationContext>;
  operationId?: AttributeAssertions<string | undefined, OperationContext>;
  tags?: AttributeAssertions<
    OpenAPIV3.OperationObject['tags'] | undefined,
    OperationContext
  >;
  parameters?: (ParameterStandard | ParameterStandardRunner<any>)[];
  responses?: ResponseStandardRunner<any>[];
  // extension attributes could be supported this way
  [x: `x-${string}`]: AttributeAssertions<
    unknown | undefined,
    OperationContext
  >;
}

export function Operation<OpenAPIType>(
  operation:
    | OperationStandard
    | {
        filter: Matcher<OpenAPIType, OperationContext>;
        standard: OperationStandard;
      }
) {
  const standard = 'filter' in operation ? operation.standard : operation;
  const matcher =
    'filter' in operation
      ? operation.filter
      : { matchesName: 'Applies to All Operations', predicate: () => true };

  return new OperationStandardRunner(standard, matcher);
}

export class OperationStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIType,
  OperationContext,
  FactVariant<OpenApiKind.Operation>
> {
  constructor(
    private standard: OperationStandard,
    private matches: Matcher<OpenAPIType, OperationContext>
  ) {
    super();
  }

  override collect(inputs: RunnerEntityInputs) {
    const results: {
      added: FactVariant<OpenApiKind.Operation>[];
      removed: FactVariant<OpenApiKind.Operation>[];
      continuous: {
        before: FactVariant<OpenApiKind.Operation>;
        after: FactVariant<OpenApiKind.Operation>;
      }[];
    } = {
      added: [],
      removed: [],
      continuous: [],
    };

    const before = inputs.beforeFacts.filter(
      (fact) => fact.location.kind === OpenApiKind.Operation
    ) as FactVariant<OpenApiKind.Operation>[];
    const after = inputs.afterFacts.filter(
      (fact) => fact.location.kind === OpenApiKind.Operation
    ) as FactVariant<OpenApiKind.Operation>[];

    const operationChanges = inputs.changelog.filter(
      (change) => change.location.kind === OpenApiKind.Operation
    ) as ChangeVariant<OpenApiKind.Operation>[];

    operationChanges.forEach((change) => {
      if (change.added) {
        results.added.push({ location: change.location, value: change.added });
      } else if (change.removed) {
        results.removed.push({
          location: change.location,
          value: change.removed.before,
        });
      } else if (change.changed) {
        results.continuous.push({
          before: { value: change.changed.before, location: change.location },
          after: { value: change.changed.after, location: change.location },
        });
      }
    });

    after.forEach((operation) => {
      // get everything in the spec that did not change
      if (
        results.continuous.some(
          (op) =>
            'path' in op.after.location.conceptualLocation &&
            op.after.location.conceptualLocation.path ===
              operation.value.pathPattern &&
            'method' in op.after.location.conceptualLocation &&
            op.after.location.conceptualLocation.method ===
              operation.value.method
        )
      )
        return;
      results.continuous.push({
        before: before.find(
          (beforeFact) =>
            beforeFact.location.conceptualLocation.path ===
              operation.location.conceptualLocation.path &&
            beforeFact.location.conceptualLocation.method ===
              operation.location.conceptualLocation.method
        )!,
        after: operation,
      });
    });
    return results;
  }

  collectParametersAsClasses() {
    return (
      this.standard.parameters?.map((param) => {
        if (param instanceof ParameterStandardRunner) {
          return param;
        } else {
          return new ParameterStandardRunner(
            param,
            matches('all parameters', () => true)
          );
        }
      }) || []
    );
  }

  toMarkdown(): MarkdownSequence {
    const { parameters, responses, ...other } = this.standard;

    const parametersAsClasses = this.collectParametersAsClasses();

    return [
      Markdown.h1(`Operation Standard: ${this.matches.matchesName}`),
      ...renderAttributes(other as any),
      ...(parameters?.length
        ? [
            '\n',
            Markdown.h2('Parameters'),
            ...parametersAsClasses.map((i) => i.toMarkdown().join('')),
          ]
        : []),
      ...(responses?.length
        ? [
            '\n',
            Markdown.h2('Responses'),
            ...responses.map((i) => i.toMarkdown().join('')),
          ]
        : []),
    ];
  }
}
