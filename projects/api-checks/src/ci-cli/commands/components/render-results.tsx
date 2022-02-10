import { Box, Text } from 'ink';
import React from 'react';
import { ResultWithSourcemap } from '@useoptic/openapi-utilities';
import groupBy from 'lodash.groupby';
import Link from 'ink-link';
import isUrl from 'is-url';

export enum SourcemapRendererEnum {
  local,
  github,
}

export function RenderCheckResults(props: {
  results: ResultWithSourcemap[];
  verbose: boolean;
  mapToFile: SourcemapRendererEnum;
}) {
  const groupedResults = groupBy(
    props.results,
    (result) =>
      `${result.change.location.conceptualLocation.method}-${result.change.location.conceptualLocation.path}`
  );

  return (
    <Box
      alignItems="flex-start"
      flexDirection="column"
      width={process.env.COLUMNS || '5000'}
    >
      {Object.keys(groupedResults)
        .sort()
        .map((key) => {
          const operationResults = groupedResults[key] as ResultWithSourcemap[];
          const {
            method,
            path,
          } = operationResults[0]!.change.location.conceptualLocation;

          const allPasses = operationResults.every((i) => i.passed);

          return (
            <Box key={key} alignItems="flex-start" flexDirection="column">
              <Box paddingLeft={1} paddingRight={2}>
                <Box width={7}>
                  {allPasses ? (
                    <Text backgroundColor="green" bold>
                      {' '}
                      PASS{' '}
                    </Text>
                  ) : (
                    <Text backgroundColor="red" bold>
                      {' '}
                      FAIL{' '}
                    </Text>
                  )}
                </Box>
                <Text color="white">
                  <Text bold>{method.toUpperCase()}</Text> {path}
                </Text>
              </Box>
              <Box flexDirection="column" marginBottom={2}>
                {operationResults.map((result, index) => {
                  if (result.passed && !props.verbose) {
                    return null;
                  }

                  return (
                    <Box
                      key={index}
                      alignItems="flex-start"
                      flexDirection="column"
                      paddingLeft={2}
                    >
                      <Text>
                        {result.passed ? (
                          <Text color="green">✔ </Text>
                        ) : (
                          <Text color="red">x </Text>
                        )}
                        <Text>
                          {result.where} {result.isMust ? 'must' : 'should'}{' '}
                          {result.condition}
                        </Text>
                      </Text>
                      {!result.passed && (
                        <Box paddingLeft={2}>
                          <Text color="red">{result.error}</Text>
                        </Box>
                      )}
                      {props.mapToFile === SourcemapRendererEnum.local && (
                        <SourcemapInLocalContext result={result} />
                      )}
                      {props.mapToFile === SourcemapRendererEnum.github && (
                        <SourceInGitHubContext result={result} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
    </Box>
  );
}

function SourcemapInLocalContext(props: { result: ResultWithSourcemap }) {
  const { result } = props;
  return (
    <>
      {result.docsLink ? (
        <Box paddingLeft={2}>
          <Link url={result.docsLink} fallback={true}>
            <Text underline color="blue">
              Read more in our API guide
            </Text>
          </Link>
        </Box>
      ) : null}
      {result.sourcemap ? (
        <Box paddingLeft={2}>
          <Text>at </Text>
          {isUrl(result.sourcemap.filePath) ? (
            <>
              <Text underline>{result.sourcemap.filePath}</Text>
              <Text> line {result.sourcemap.startLine}</Text>
            </>
          ) : (
            <Text underline>
              {result.sourcemap.filePath}:{result.sourcemap.startLine}:
              {result.sourcemap.startPosition})
            </Text>
          )}
        </Box>
      ) : null}
    </>
  );
}

function SourceInGitHubContext(props: { result: ResultWithSourcemap }) {
  const { result } = props;

  function escapeForGitHubActions(s: string): string {
    return s
      .replace(/%/g, '%25')
      .replace(/\r/g, '%0D')
      .replace(/\n/g, '%0A')
      .replace(/:/g, '%3A')
      .replace(/,/g, '%2C');
  }

  if (result.sourcemap) {
    const messageLines: string[] = [
      `${result.where} ${result.isMust ? 'must' : 'should'} ${
        result.condition
      }`,
    ];

    if (result.docsLink) {
      messageLines.push(`documentation ${result.docsLink}`);
    }

    const errorInvoke = `::warning file=${result.sourcemap.filePath},line=${
      result.sourcemap.startLine
    },title=${escapeForGitHubActions(result.error!)}::${escapeForGitHubActions(
      messageLines.join('\n')
    )}`;

    return <Text>{errorInvoke}</Text>;
  } else return <SourcemapInLocalContext result={result} />;
}
