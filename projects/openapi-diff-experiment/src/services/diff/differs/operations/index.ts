import { OpenAPIDiffingQuestions } from '../../../read/types';
import { ApiTraffic } from '../../../traffic/types';
import { DiffResult, EitherDiffResult } from '../../types';

export function operationDiff(openApiQuestions: OpenAPIDiffingQuestions) {
  // @todo add ignore
  const ignore = [];
  // @todo add hostname/baseurl checkers

  return {
    responseDiffsForTraffic: (apiTraffic: ApiTraffic): EitherDiffResult => {
      return DiffResult.match();
    },
  };
}
