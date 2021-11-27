import { TrafficSource } from '../../../services/traffic/types';

import { newDiffMachine } from '../../machine';
import { SpecInterfaceFactory } from '../../../services/openapi-read-patch-interface';
import { createDiffServiceWithCachingProjections } from '../../../services/diff/diff-service';
import { useActor } from '@xstate/react';
import { useEffect, useMemo, useState } from 'react';
import { createAgentMachine } from '../../agents/agent';
import { AgentEventEnum, AgentIntent } from '../../agents/agent-interface';
import { AgentLogEvent } from '../../agents/agent-log-events';
import { baselineDefaults } from '../../machine-interface';
import { DiffAgentContextInput } from '../context/diff-agent-context';

export function useIntentDrivenDiffMachine(
  source: TrafficSource,
  intentFactory: () => AgentIntent,
  openApiInterfaceFactory: SpecInterfaceFactory
) {
  const [log, setLog] = useState<AgentLogEvent[]>([]);

  const intent = useMemo(intentFactory, [intentFactory]);

  const { agent, diffMachine } = useMemo(() => {
    const diffMachine = newDiffMachine(
      source,
      openApiInterfaceFactory,
      (spec) => createDiffServiceWithCachingProjections(spec),
      baselineDefaults,
      (logEvent) => setLog((i) => [...i, logEvent])
    );

    return createAgentMachine(diffMachine, intent);
  }, []);

  useEffect(() => {
    if (agent) source.start();
  }, [agent]);

  const [state, send] = useActor(agent);

  const diffAgentContext: DiffAgentContextInput = {
    diffMachine,
    answer: (id: string, answer: any) =>
      send({ type: AgentEventEnum.AnswerQuestion, id, answer }),
    skipInteraction: () => send({ type: AgentEventEnum.SkipInteraction }),
    skipQuestion: () => send({ type: AgentEventEnum.SkipQuestion }),
  };

  return {
    log,
    intent,
    state: state.value || '',
    context: state.context,
    diffAgentContext,
  };
}
