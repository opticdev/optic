/*
  Agents are presented with questions, and must decide how to answer them. Possible answers
  - see a new url | add a new path, ignore the path/method pattern
  - see a shape diff | extend spec, replace, type
  - see a new body   | add it, ignore it
 */

import { ApiTraffic } from '../../services/traffic/types';
import { DiffType, IDiff, UnmatchedPath } from '../../services/diff/types';
import { v4 as uuidv4 } from 'uuid';

export type QuestionsForAgent = AddPathQuestion;

export type QuestionsForAgentAnswered = QuestionsForAgent & {
  answer: QuestionsForAgent['answer'];
};

interface Questions<A> {
  type: AnswerQuestionTypes;
  answer?: A;
  uuid: string;
}

export enum AnswerQuestionTypes {
  AddPath,
}

// Path add  Q / A
export interface AddPathQuestion extends Questions<AddPathAnswer> {
  type: AnswerQuestionTypes.AddPath;
  diff: UnmatchedPath;
  example: ApiTraffic;
}
export interface AddPathAnswer {
  pathPattern: string;
}
