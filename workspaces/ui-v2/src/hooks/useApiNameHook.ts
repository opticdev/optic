import { useEffect, useState } from 'react';
import { useConfigRepository } from './useConfigHook';

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
