import React from 'react';
import { Box, Spacer, Static, Text } from 'ink';
import { AgentLogEvent, AgentLogEvents } from '../../agents/agent-log-events';

export function Log(props: { log: AgentLogEvent[] }) {
  return (
    <Static items={props.log}>
      {(logItem: AgentLogEvent, index) => {
        switch (logItem.event) {
          case AgentLogEvents.reading:
            return (
              <Box key={index + 'reading'}>
                <Text color="grey" bold>
                  ↪ reading specification from {logItem.location}
                </Text>
              </Box>
            );
            break;
          case AgentLogEvents.diffingTraffic:
            return (
              <Box key={index + 'diffing'} flexDirection="row" width="100%">
                <Box paddingLeft={2} paddingRight={1} width={10}>
                  {logItem.hasDiffs ? (
                    <Text backgroundColor="red" bold>
                      {' Diff  '}
                    </Text>
                  ) : (
                    <Text backgroundColor="blue" bold>
                      {' Match '}
                    </Text>
                  )}
                </Box>
                <Box>
                  <Box flexDirection="row" width="80%">
                    <Text bold color="grey">
                      {logItem.method.toUpperCase()}{' '}
                    </Text>
                    <Text color="grey">{logItem.path}</Text>
                    <Spacer />
                    <Text color="grey">{logItem.statusCode} response</Text>
                  </Box>
                </Box>
              </Box>
            );
            break;
          case AgentLogEvents.patching:
            return (
              <Box key={index + 'patching'} flexDirection="column">
                <Text color="grey" bold>
                  ↩ patching specification
                </Text>
                <Box
                  paddingLeft={2}
                  key={index + 'items_in_patch_log'}
                  flexDirection="column"
                >
                  {logItem.patches.map((patchDesc, index) => {
                    return (
                      <Text color="grey" key={index + '_items_in_patch_log'}>
                        - {patchDesc}
                      </Text>
                    );
                  })}
                </Box>
              </Box>
            );
            break;
          case AgentLogEvents.error:
            return (
              <Box key={index + 'patching'} flexDirection="row" paddingLeft={2}>
                <Text color="yellow" bold>
                  warning: <Text>{logItem.error}</Text>
                </Text>
              </Box>
            );
            break;
        }
      }}
    </Static>
  );
}
