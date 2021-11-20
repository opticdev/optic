import { AgentIntent } from '../agent-interface';
import { AnswerQuestionTypes } from '../questions';
import {
  DiffType,
  IDiffService,
  QueryAdditionalParameter,
  ShapeDiffTypes,
  UnmatchedPath,
  UnmatchedResponse,
} from '../../../services/diff/types';
import { v4 as uuidv4 } from 'uuid';
import { JsonSchemaPatch } from '../../../services/diff/differs/json-schema-json-diff/plugins/plugin-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function baselineIntent(): AgentIntent {
  return {
    name: 'baseline',
    handleDiffs: (
      diff,
      example,
      patch,
      diffService: IDiffService,
      askQuestion
    ) => {
      switch (diff.type) {
        case DiffType.UnmatchedPath: {
          askQuestion({
            type: AnswerQuestionTypes.AddPath,
            uuid: uuidv4(),
            diff: diff as UnmatchedPath,
            example,
          });
          break;
        }
        case DiffType.UnmatchedMethod: {
          const { path, method } = diff as UnmatchedPath;
          patch.init.operation(path, method, example);

          break;
        }
        // handle parameter diffs
        case DiffType.QueryAdditionalParameter: {
          const { path, method, name, example } =
            diff as QueryAdditionalParameter;
          patch.init.queryParameter(method, path, name, example);
          break;
        }
        // handle property diffs
        case DiffType.BodyAdditionalProperty:
        case DiffType.BodyUnmatchedType:
        case DiffType.BodyMissingRequiredProperty: {
          if (shouldSkipOneOne(diff as ShapeDiffTypes)) {
            return;
          }

          const possiblePatches = diffService.jsonSchemaDiffer.diffToPatch(
            diff as ShapeDiffTypes,
            patch.forkedPatcher()
          );
          const extendingPatch = possiblePatches.find((i) => i.extends) as
            | JsonSchemaPatch
            | undefined;
          if (extendingPatch) {
            patch.patch.property(extendingPatch);
          }

          break;
        }
        case DiffType.UnmatchedResponse: {
          const { path, method, statusCode } = diff as UnmatchedResponse;
          patch.init.response(path, method, example);
          break;
        }
        default:
          console.warn(`diff type not handed by agent ${diff.type}`);
      }
    },
    applyAnswerAsPatch: (questionAnswer, patch) => {
      if (!questionAnswer.answer) throw new Error('no answer provided');

      switch (questionAnswer.type) {
        case AnswerQuestionTypes.AddPath:
          const addPath = questionAnswer;
          patch.init.operation(
            addPath.answer.pathPattern,
            addPath.diff.method,
            addPath.example
          );
          break;
      }
    },
  };
}

/*
  Extending a one of automatically is tricky business.
  Any strategy can be configured by the user, and employed -- the current one is skipping
 */
function shouldSkipOneOne(diff: ShapeDiffTypes) {
  if (diff.type === DiffType.BodyUnmatchedType) {
    return (
      jsonPointerHelpers.decode(diff.schemaPath).includes('oneOf') ||
      jsonPointerHelpers.decode(diff.propertyPath).includes('oneOf')
    );
  }
  if (diff.type === DiffType.BodyAdditionalProperty) {
    return (
      jsonPointerHelpers.decode(diff.schemaPath).includes('oneOf') ||
      jsonPointerHelpers.decode(diff.parentObjectPath).includes('oneOf')
    );
  }
  if (diff.type === DiffType.BodyMissingRequiredProperty) {
    return (
      jsonPointerHelpers.decode(diff.schemaPath).includes('oneOf') ||
      jsonPointerHelpers.decode(diff.parentObjectPath).includes('oneOf')
    );
  }

  return false;
}
