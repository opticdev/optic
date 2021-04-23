import { useMemo } from 'react';
import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';

// TODO implement
export interface IContribution {}

// TODO implement
const ContributionsQuery = ``;

export const useContributions = (): IContribution[] => {
  const { data, error } = useSpectacleQuery({
    query: ContributionsQuery,
    variables: {},
  });

  if (error) {
    debugger;
  }

  // TODO implement
  return useMemo(() => {
    return data ? data : [];
  }, [data]);
};
