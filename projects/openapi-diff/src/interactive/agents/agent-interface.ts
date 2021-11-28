import { AnswerQuestionTypes, QuestionsForAgent } from './questions';
import { ApiTraffic } from '../../services/traffic/types';
import { IDiff, IDiffService } from '../../services/diff/types';
import { IPatchOpenAPI } from '../../services/patch/types';
import { OpenAPIDiffingQuestions } from '../../services/read/types';
import { OpenAPIV3 } from 'openapi-types';

export interface AgentContext {}

export enum AgentEventEnum {
  DiffReceived = 'DiffReceived',
  Reset = 'Reset',
  AnswerQuestion = 'AnswerQuestion',
  SkipInteraction = 'SkipInteraction',
  SkipQuestion = 'SkipQuestion',
  AdvancePastError = 'AdvancePastError',
  Start = 'Start',
  Finish = 'Finish',
}

export type ProcessDiffContext = AgentContext & {
  diffs: IDiff[];
  traffic: ApiTraffic;
};
export type WaitingOnInputDiffContext = AgentContext & {
  diffs: IDiff[];
  questions: QuestionsForAgent[];
  traffic: ApiTraffic;
};

export type AgentEvent =
  | { type: AgentEventEnum.DiffReceived; diffs: IDiff[]; traffic: ApiTraffic }
  | { type: AgentEventEnum.AnswerQuestion; id: string; answer: any }
  | { type: AgentEventEnum.Reset }
  | { type: AgentEventEnum.SkipInteraction }
  | { type: AgentEventEnum.SkipQuestion };

export type AgentTypestate =
  | {
      value: 'idle';
      context: AgentContext;
    }
  | {
      value: 'process_diffs';
      context: ProcessDiffContext;
    }
  | {
      value: 'waiting_for_input';
      context: WaitingOnInputDiffContext;
    }
  | {
      value: 'error';
      context: AgentContext & { error: string };
    }
  | {
      value: 'finished';
      context: AgentContext & {};
    };

export interface AgentIntent {
  name: string;
  filterDiffs: (
    diffs: IDiff[],
    questions: OpenAPIDiffingQuestions,
    traffic: ApiTraffic,
    spec: OpenAPIV3.Document
  ) => IDiff[];
  handleDiffs: (
    diff: IDiff,
    example: ApiTraffic,
    patch: IPatchOpenAPI,
    diffService: IDiffService,
    askQuestion: (question: QuestionsForAgent) => void
  ) => void;
  // filterDiffs:
  applyAnswerAsPatch: (
    questionAnswer: QuestionsForAgent,
    patch: IPatchOpenAPI
  ) => void;
}
