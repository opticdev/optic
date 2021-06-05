import { useEffect, useState } from 'react';
import { Client } from '@useoptic/cli-client';

export function useClientAgent() {
  const [clientAgent, setClientAgent] = useState<string>('anon_id');
  useEffect(() => {
    async function loadIdentity() {
      const client = new Client('/api');
      try {
        const response = await client.getIdentity();
        if (response.ok) {
          const { anonymousId } = await response.json();
          setClientAgent(anonymousId);
        } else {
          throw new Error();
        }
      } catch (e) {}
    }
    loadIdentity();
  }, []);
  return clientAgent;
}
