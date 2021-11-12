import { Box, Text } from "ink";
import React from "react";
import { Result, ResultWithSourcemap } from "../../sdk/types";
import groupBy from "lodash.groupby";
import Link from "ink-link";

export function RenderCheckResults(props: {
  results: ResultWithSourcemap[];
  verbose: boolean;
}) {
  const groupedResults = groupBy(
    props.results,
    (result) =>
      `${result.change.location.conceptualLocation.method}-${result.change.location.conceptualLocation.path}`
  );

  return (
    <Box alignItems="flex-start" flexDirection="column">
      {Object.keys(groupedResults)
        .sort()
        .map((key) => {
          const operationResults = groupedResults[key] as ResultWithSourcemap[];
          const { method, path } =
            operationResults[0]!.change.location.conceptualLocation;

          const allPasses = operationResults.every((i) => i.passed);

          return (
            <Box key={key} alignItems="flex-start" flexDirection="column">
              <Box paddingLeft={1} paddingRight={2}>
                <Box width={7}>
                  {allPasses ? (
                    <Text backgroundColor="green" bold>
                      {" "}
                      PASS{" "}
                    </Text>
                  ) : (
                    <Text backgroundColor="red" bold>
                      {" "}
                      FAIL{" "}
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
                          {result.where} {result.isMust ? "must" : "should"}{" "}
                          {result.condition}
                        </Text>
                      </Text>
                      {!result.passed && (
                        <Box paddingLeft={2}>
                          <Text color="red">{result.error}</Text>
                        </Box>
                      )}
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
                          <Text underline color="blue">
                            {`at (${result.sourcemap.filePath}:${result.sourcemap.startLine}:${result.sourcemap.startPosition})`}
                          </Text>
                        </Box>
                      ) : null}
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
