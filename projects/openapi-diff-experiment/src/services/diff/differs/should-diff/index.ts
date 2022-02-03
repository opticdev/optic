import { OpenAPIDiffingQuestions } from '../../../read/types';
import { DiffResult, EitherDiffResult } from '../../types';
import { ApiTraffic } from '../../../traffic/types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function shouldDiffAgainstThisSpec(
  openApiQuestions: OpenAPIDiffingQuestions
) {
  // @todo add ignore
  const ignore = [];

  const ignoreMethods = [
    OpenAPIV3.HttpMethods.OPTIONS,
    OpenAPIV3.HttpMethods.HEAD,
    OpenAPIV3.HttpMethods.TRACE,
  ];

  const ignoreExtensions = [
    '.htm',
    '.html',
    '.ico',
    '.css',
    '.js',
    '.woff',
    '.woff2',
    '.png',
    '.jpg',
    '.jpg',
    '.jpeg',
    '.svg',
    '.gif',
    '.mov',
  ];

  return {
    responseDiffsForTraffic: (apiTraffic: ApiTraffic): EitherDiffResult => {
      if (ignoreMethods.includes(apiTraffic.method)) {
        return DiffResult.error(
          `skipping method ${apiTraffic.method} ${apiTraffic.path}`
        );
      } else if (ignoreExtensions.some((i) => apiTraffic.path.endsWith(i))) {
        return DiffResult.error(
          `skipping extension ${apiTraffic.method} ${apiTraffic.path}`
        );
      }
      return DiffResult.match();
    },
  };
}
