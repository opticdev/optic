import React from 'react';
import { AnswerQuestionTypes, QuestionsForAgent } from '../../agents/questions';
import { UnmatchedPathQuestion } from './unmatched-path-question';
import { ReviewBodyPropertyPatches } from './review-body-property-patches';

export function componentForQuestion(question: QuestionsForAgent | undefined) {
  if (!question) return null;

  switch (question.type) {
    case AnswerQuestionTypes.AddPath:
      return <UnmatchedPathQuestion key={question.uuid} question={question} />;
    case AnswerQuestionTypes.ReviewPatchesForBodyPropertyDiff:
      return (
        <ReviewBodyPropertyPatches key={question.uuid} question={question} />
      );
    default:
      throw new Error('no registered question / answer component');
  }
}
