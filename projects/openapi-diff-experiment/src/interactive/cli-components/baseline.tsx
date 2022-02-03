import React, { useMemo, useRef } from 'react';
import { TrafficSource } from '../../services/traffic/types';
import { Box, Newline, Static, Text } from 'ink';
import { useIntentDrivenDiffMachine } from './hooks/use-intent-driven-diff-machine';
import { AnswerQuestionTypes, QuestionsForAgent } from '../agents/questions';
import { UnmatchedPathQuestion } from './questions/unmatched-path-question';
import { baselineIntent } from '../agents/intents/baseline';
import { WaitingOnInputDiffContext } from '../agents/agent-interface';
import { Log } from './ui/log';
import { createOpenApiFileSystemReader } from '../../services/read/read';
import { PassThroughSpecReader } from '../../services/read/debug-implementations';
import {
  OpenApiInterface,
  SpecInterfaceFactory,
} from '../../services/openapi-read-patch-interface';
import { StringifyReconciler } from '../../services/patch/reconcilers/stringify-reconciler';
import { componentForQuestion } from './questions/registry';
import {
  DiffAgentContext,
  DiffAgentContextProvider,
} from './context/diff-agent-context';
import { BypassError } from './ui/bypass-error';

export function Baseline(props: {
  source: TrafficSource;
  openApiFilePath?: string;
}) {
  const specInterface: SpecInterfaceFactory = useMemo(() => {
    const specReader = props.openApiFilePath
      ? createOpenApiFileSystemReader(props.openApiFilePath)
      : new PassThroughSpecReader();

    return async () =>
      OpenApiInterface(specReader, (reader) => StringifyReconciler(reader));
  }, [props.openApiFilePath]);

  const { state, context, diffAgentContext, log } = useIntentDrivenDiffMachine(
    props.source,
    baselineIntent,
    specInterface
  );
  let dynamic = <></>;

  if (state === 'waiting_for_input') {
    const waitingForInputContext = context as WaitingOnInputDiffContext;
    const firstUnansweredQuestion = waitingForInputContext.questions.find(
      (i) => !i.answer
    );
    if (firstUnansweredQuestion) {
      dynamic = <>{componentForQuestion(firstUnansweredQuestion)}</>;
    }
  }

  return (
    <DiffAgentContextProvider context={diffAgentContext}>
      <Box flexDirection="column">
        <Log log={log} />
        {state === 'waiting_for_input' && (
          <Box flexDirection="column">{dynamic}</Box>
        )}
        {state === 'error' && <BypassError />}
      </Box>
    </DiffAgentContextProvider>
  );
}
