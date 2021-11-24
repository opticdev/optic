import { TrafficSource } from '../../../services/traffic/types';

import { newDiffMachine } from '../../machine';
import { OpenApiInterface } from '../../../services/openapi-read-patch-interface';
import { PassThroughSpecReader } from '../../../services/read/debug-implementations';
import { StringifyReconciler } from '../../../services/patch/reconcilers/stringify-reconciler';
import { createDiffServiceWithCachingProjections } from '../../../services/diff/diff-service';
import { useActor } from '@xstate/react';
import { useEffect, useMemo, useState } from 'react';
import { createAgentMachine } from '../../agents/agent';
import { AgentEventEnum, AgentIntent } from '../../agents/agent-interface';
import { AgentLogEvent } from '../../agents/agent-log-events';
import { baselineDefaults } from '../../machine-interface';
import { createOpenApiFileSystemReader } from '../../../services/read/read';

export function useIntentDrivenDiffMachine(
  source: TrafficSource,
  intentFactory: () => AgentIntent,
  openApiFilePath?: string
) {
  const [log, setLog] = useState<AgentLogEvent[]>([]);

  const agentActor = useMemo(() => {
    const specReader = openApiFilePath
      ? createOpenApiFileSystemReader(openApiFilePath)
      : new PassThroughSpecReader();

    const diffMachine = newDiffMachine(
      source,
      () =>
        OpenApiInterface(specReader, (reader) => StringifyReconciler(reader)),
      (spec) => createDiffServiceWithCachingProjections(spec),
      baselineDefaults,
      (logEvent) => setLog((i) => [...i, logEvent])
    );

    return createAgentMachine(diffMachine, intentFactory());
  }, []);

  useEffect(() => {
    if (agentActor) source.start();
  }, [agentActor]);

  const [state, send] = useActor(agentActor);

  return {
    log,
    state: state.value || '',
    context: state.context,
    send: {
      answer: (id: string, answer: any) =>
        send({ type: AgentEventEnum.AnswerQuestion, id, answer }),
      skipInteraction: () => send({ type: AgentEventEnum.SkipInteraction }),
    },
  };
}
