import { IDiff } from '../../../services/diff/types';
import {
  PatchPreview,
  useDiffAgentActions,
} from '../context/diff-agent-context';
import { useEffect, useState } from 'react';

export function usePatches(diff: IDiff) {
  const [patches, setPatches] = useState<PatchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const actions = useDiffAgentActions();

  useEffect(() => {
    async function task() {
      const patches = await actions.computePossiblePatches(diff);
      setPatches(patches);
      setLoading(false);
    }

    task();
  }, [diff]);

  return { patches, loading };
}
