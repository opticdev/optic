import { useState } from 'react';
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import PathUrl from './attributes/url';
import BaseNode from './attributes/base-node';
import { OperationDoc } from './OperationDoc';
import { OperationYml } from './OperationYml';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  getOperationId,
  type InternalSpecEndpoint,
  type Changelog,
} from './utils';
import type { FlatOpenAPIV2, FlatOpenAPIV3 } from '@useoptic/openapi-utilities';
import { ChangeIndicator } from './attributes/change-indicator';

export const ChangelogOperation = (props: {
  operation: {
    originalOp: FlatOpenAPIV2.OperationObject | FlatOpenAPIV3.OperationObject;
    operation: InternalSpecEndpoint;
    changelog?: Changelog<InternalSpecEndpoint>;
  };
  open: boolean;
  toggleViewed: (key: string) => void;
  showAnchors: boolean;
}) => {
  const { open, toggleViewed } = props;
  const { path: pathPattern, method } = props.operation.operation;
  const operationKey = getOperationId({
    method,
    pathPattern,
  });
  const [view, setView] = useState<'doc' | 'yml'>('doc');

  return (
    <Paper
      sx={{
        backgroundColor: '#f7f8fc',
      }}
    >
      <BaseNode changelog={props.operation.changelog} noBg radius large>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <ChangeIndicator
              changelog={props.operation.changelog}
              fontSize={14}
            />
            <PathUrl method={method} pathPattern={pathPattern} />
          </div>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ToggleButtonGroup
              size="small"
              sx={{ marginRight: 2, height: 32 }}
              value={view}
              exclusive={true}
              onChange={(_event, value) => {
                setView(value);
              }}
            >
              <ToggleButton value="yml">
                <Tooltip title="OpenAPI Diff">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CodeIcon />
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="doc">
                <Tooltip title="Documentation Diff">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <DescriptionIcon />
                  </Box>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            {toggleViewed ? (
              <FormControlLabel
                control={
                  <Checkbox
                    value={!open}
                    onChange={() => toggleViewed(operationKey)}
                  />
                }
                label={<span style={{ fontWeight: 700 }}>Viewed</span>}
              />
            ) : null}
          </Box>
        </Box>
        <Collapse in={open}>
          <Box
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {view === 'doc' ? (
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  backgroundColor: 'white',
                }}
              >
                <OperationDoc
                  operation={props.operation.operation}
                  showAnchors={props.showAnchors}
                />
              </Box>
            ) : (
              <OperationYml
                method={method}
                pathPattern={pathPattern}
                value={props.operation.originalOp}
                changelog={props.operation.changelog}
                showAnchors={props.showAnchors}
              />
            )}
          </Box>
        </Collapse>
      </BaseNode>
    </Paper>
  );
};
