import React, { useRef } from 'react';
import { TrafficSource } from '../../services/traffic/types';
import { Box, Newline, Static, Text } from 'ink';
import { useIntentDrivenDiffMachine } from './hooks/use-intent-driven-diff-machine';
import { AnswerQuestionTypes, QuestionsForAgent } from '../agents/questions';
import { UnmatchedPathQuestion } from './questions/unmatched-path-question';
import { baselineIntent } from '../agents/intents/baseline';
import { WaitingOnInputDiffContext } from '../agents/agent-interface';
import { Log } from './ui/log';

export function Baseline(props: {
  source: TrafficSource;
  openApiFilePath?: string;
}) {
  const { state, context, send, log } = useIntentDrivenDiffMachine(
    props.source,
    baselineIntent,
    props.openApiFilePath
  );
  let dynamic = <></>;

  if (state === 'waiting_for_input') {
    const waitingForInputContext = context as WaitingOnInputDiffContext;
    const firstUnansweredQuestion = waitingForInputContext.questions.find(
      (i) => !i.answer
    );
    if (firstUnansweredQuestion) {
      dynamic = (
        <>
          {componentForQuestion(
            firstUnansweredQuestion,
            send.answer,
            send.skipInteraction
          )}
        </>
      );
    }
  }

  return (
    <Box flexDirection="column">
      <Log log={log} />
      {state === 'waiting_for_input' && (
        <Box flexDirection="column">{dynamic}</Box>
      )}
    </Box>
  );
}

function componentForQuestion(
  question: QuestionsForAgent | undefined,
  answerQuestion: (questionId: string, answer: any) => void,
  skip: () => void
) {
  if (!question) return null;

  switch (question.type) {
    case AnswerQuestionTypes.AddPath:
      return (
        <UnmatchedPathQuestion
          key={question.uuid}
          question={question}
          answerQuestion={answerQuestion}
          skipInteraction={skip}
        />
      );
    default:
      throw new Error(
        'no registered question / answer component for ' + question
      );
  }
}
