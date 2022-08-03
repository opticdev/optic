/*
  Agents are presented with questions, and must decide how to answer them. Possible answers
  - see a new url | add a new path, ignore the path/method pattern
  - see a shape diff | extend spec, replace, type
  - see a new body   | add it, ignore it
 */

import { ApiTraffic } from '../../services/traffic/types';
import {
  DiffType,
  IDiff,
  ShapeDiffTypes,
  UnmatchedPath,
} from '../../services/diff/types';
import { v4 as uuidv4 } from 'uuid';
import { IPatchGroup } from '../../services/patch/incremental-json-patch/json-patcher';
import { JsonSchemaPatch } from '../../services/diff/differs/json-schema-json-diff/plugins/plugin-types';

export type QuestionsForAgent = AddPathQuestion | PatchesForBodyPropertyDiff;

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
  ReviewPatchesForBodyPropertyDiff,
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

// Body Property add  Q / A
export interface PatchesForBodyPropertyDiff
  extends Questions<PatchesForBodyPropertyDiffAnswer> {
  type: AnswerQuestionTypes.ReviewPatchesForBodyPropertyDiff;
  diff: ShapeDiffTypes;
  example: ApiTraffic;
}
export interface PatchesForBodyPropertyDiffAnswer {
  patch: JsonSchemaPatch;
}
