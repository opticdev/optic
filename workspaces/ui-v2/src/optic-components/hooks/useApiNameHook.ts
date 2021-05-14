import { useConfigRepository } from '<src>/optic-components/hooks/useConfigHook';
import { useEffect, useState } from 'react';

export function useApiName() {
  const { config } = useConfigRepository();
  const [name, setName] = useState('');
  useEffect(() => {
    async function task() {
      if (!name) {
        setName(await config.getApiName());
      }
    }
    task();
  }, [config, name, setName]);
  return name;
}
