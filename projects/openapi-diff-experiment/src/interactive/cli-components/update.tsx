import React from 'react';
import { TrafficSource } from '../../services/traffic/types';
import { Box } from 'ink';
import { useIntentDrivenDiffMachine } from './hooks/use-intent-driven-diff-machine';
import { Log } from './ui/log';
import { SpecInterfaceFactory } from '../../services/openapi-read-patch-interface';
import { updateIntent } from '../agents/intents/update';
import { WaitingOnInputDiffContext } from '../agents/agent-interface';
import { componentForQuestion } from './questions/registry';
import { DiffAgentContextProvider } from './context/diff-agent-context';

export function Update(props: {
  source: TrafficSource;
  specInterfaceFactory: SpecInterfaceFactory;
}) {
  const { state, context, diffAgentContext, log } = useIntentDrivenDiffMachine(
    props.source,
    updateIntent,
    props.specInterfaceFactory
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
      </Box>
    </DiffAgentContextProvider>
  );
}
