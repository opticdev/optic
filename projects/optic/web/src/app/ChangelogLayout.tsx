import { useCallback, useState } from 'react';
import { Box, LinearProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ChangelogOperation } from './ChangelogOperation';
import {
  getOperationId,
  type InternalSpecEndpoint,
  type Changelog,
} from './utils';
import type { FlatOpenAPIV2, FlatOpenAPIV3 } from '@useoptic/openapi-utilities';

export function ChangelogLayout({
  operations,
  showAnchors,
}: {
  operations: {
    originalOp: FlatOpenAPIV2.OperationObject | FlatOpenAPIV3.OperationObject;
    operation: InternalSpecEndpoint;
    changelog?: Changelog<InternalSpecEndpoint>;
  }[];
  showAnchors: boolean;
}) {
  const [viewed, setViewed] = useState<Map<string, boolean>>(new Map());

  const toggleViewed = useCallback(
    (key: string) => {
      setViewed((reviewState) => {
        reviewState.set(key, !reviewState.get(key));
        return new Map(reviewState);
      });
    },
    [setViewed]
  );

  const viewedCount = [...viewed.values()].filter((i) => !!i).length;
  const total = operations.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {operations.length ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption">
            {viewedCount}/{total}
          </Typography>
          <LinearProgress
            sx={{ width: 120 }}
            variant="determinate"
            value={(viewedCount / total) * 100}
          />
        </Box>
      ) : (
        <div>No operations changed.</div>
      )}
      {operations.map((operation) => {
        const operationId = getOperationId({
          method: operation.operation.method,
          pathPattern: operation.operation.path,
        });
        const open = !viewed.get(operationId);
        return (
          <ChangelogOperation
            open={open}
            toggleViewed={toggleViewed}
            key={operationId}
            operation={operation}
            showAnchors={showAnchors}
          />
        );
      })}
    </Box>
  );
}
