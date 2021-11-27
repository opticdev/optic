import { AgentIntent } from '../agent-interface';
import { AnswerQuestionTypes } from '../questions';
import {
  DiffType,
  IDiffService,
  ShapeDiffTypes,
  UnmatchedPath,
} from '../../../services/diff/types';
import { v4 as uuidv4 } from 'uuid';

export function updateIntent(): AgentIntent {
  return {
    name: 'update',
    handleDiffs: (
      diff,
      example,
      patch,
      diffService: IDiffService,
      askQuestion
    ) => {
      switch (diff.type) {
        case DiffType.BodyAdditionalProperty:
        case DiffType.BodyUnmatchedType:
        case DiffType.BodyMissingRequiredProperty: {
          askQuestion({
            type: AnswerQuestionTypes.ReviewPatchesForBodyPropertyDiff,
            uuid: uuidv4(),
            diff: diff as ShapeDiffTypes,
            example,
          });
          break;
        }

        case DiffType.UnmatchedPath: {
          askQuestion({
            type: AnswerQuestionTypes.AddPath,
            uuid: uuidv4(),
            diff: diff as UnmatchedPath,
            example,
          });
          break;
        }

        // }
        // case DiffType.UnmatchedMethod: {
        //   const { path, method } = diff as UnmatchedPath;
        //   patch.init.operation(path, method, example);
        //
        //   break;
        // }
        // // handle parameter diffs
        // case DiffType.QueryAdditionalParameter: {
        //   const { path, method, name, example } =
        //     diff as QueryAdditionalParameter;
        //   patch.init.queryParameter(method, path, name, example);
        //   break;
        // }
        // // handle property diffs
        // case DiffType.BodyAdditionalProperty:
        // case DiffType.BodyUnmatchedType:
        // case DiffType.BodyMissingRequiredProperty: {
        //   if (shouldSkipOneOne(diff as ShapeDiffTypes)) {
        //     return;
        //   }
        //
        //   const possiblePatches = diffService.jsonSchemaDiffer.diffToPatch(
        //     diff as ShapeDiffTypes,
        //     patch.forkedPatcher()
        //   );
        //   const extendingPatch = possiblePatches.find((i) => i.extends) as
        //     | JsonSchemaPatch
        //     | undefined;
        //   if (extendingPatch) {
        //     patch.patch.property(extendingPatch);
        //   }
        //
        //   break;
        // }
        // case DiffType.UnmatchedResponse: {
        //   const { path, method, statusCode } = diff as UnmatchedResponse;
        //   patch.init.response(path, method, example);
        //   break;
        // }
        default:
          console.warn(`diff type not handed by agent ${diff.type}`);
      }
    },
    applyAnswerAsPatch: (questionAnswer, patch) => {
      if (questionAnswer.answer) {
        switch (questionAnswer.type) {
          case AnswerQuestionTypes.ReviewPatchesForBodyPropertyDiff:
            const answer = questionAnswer;
            patch.patch.property(answer.answer.patch);
            break;
          case AnswerQuestionTypes.AddPath:
            const addPath = questionAnswer;
            patch.init.operation(
              addPath.answer.pathPattern,
              addPath.diff.method,
              addPath.example
            );
            break;
        }
      } else throw new Error('no answer provided');
    },
  };
}
