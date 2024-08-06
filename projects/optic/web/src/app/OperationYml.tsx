import { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Yaml } from './attributes/Yaml';
import {
  anyChangelog,
  objectWithRemovedItems,
  allUnreserved,
  hasChanges,
  removedArrayChangelogs,
  od,
  getOperationId,
  type Changelog,
} from './utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export function OperationYml({
  value,
  changelog,
  method,
  pathPattern,
  showAnchors,
}: {
  value: any;
  changelog?: Changelog<any>;
  method: string;
  pathPattern: string;
  showAnchors: boolean;
}) {
  const operationId = getOperationId({ method, pathPattern });
  const removedParameters = removedArrayChangelogs(value.parameters) ?? [];
  const requestBodyChangelog = anyChangelog(value[od], 'requestBody');
  const allResponses = objectWithRemovedItems(value.responses);
  const operationReservedKeys = ['parameters', 'requestBody', 'responses'];
  const allMeta = allUnreserved(value, operationReservedKeys);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Object.keys(allMeta ?? {}).length > 0 ? (
        <ChangelogSection
          anchorId={`${operationId}.metadata`}
          value={value}
          showAnchors={showAnchors}
          title="Operation Metadata"
          exclude={operationReservedKeys}
          expand={
            changelog?.type === 'added' ||
            Object.keys(allMeta).some((m) => anyChangelog(value[od], m))
          }
        />
      ) : null}
      {(value.parameters ?? []).length > 0 || removedParameters.length > 0 ? (
        <ChangelogSection
          anchorId={`${operationId}.parameters`}
          value={value.parameters}
          showAnchors={showAnchors}
          changelog={anyChangelog(value[od], 'parameters')}
          title="Request Parameters"
          expand={
            changelog?.type === 'added' ||
            !!anyChangelog(value[od], 'parameters') ||
            hasChanges(value.parameters)
          }
        />
      ) : null}
      {value.requestBody || requestBodyChangelog ? (
        <>
          <ChangelogSection
            anchorId={`${operationId}.request-body`}
            value={value.requestBody}
            showAnchors={showAnchors}
            changelog={requestBodyChangelog}
            title="Request body"
            expand={
              changelog?.type === 'added' ||
              !!anyChangelog(value[od], 'requestBody') ||
              hasChanges(value.requestBody)
            }
          />
        </>
      ) : null}
      {Object.entries(allResponses ?? {}).map(([statusCode, response]) => {
        const resChangelog = anyChangelog(value.responses[od], statusCode);
        return (
          <ChangelogSection
            anchorId={`${operationId}.${statusCode}-response`}
            key={statusCode}
            value={response}
            changelog={resChangelog}
            showAnchors={showAnchors}
            title={`${statusCode} Response`}
            expand={
              changelog?.type === 'added' ||
              !!resChangelog ||
              hasChanges(response)
            }
          />
        );
      })}
    </Box>
  );
}

function ChangelogSection({
  title,
  value,
  exclude,
  changelog,
  expand: expandInit,
  anchorId,
  showAnchors,
}: {
  title: string;
  value: any;
  exclude?: string[];
  changelog?: Changelog<any>;
  expand?: boolean;
  anchorId: string;
  showAnchors: boolean;
}) {
  const [expand, setExpand] = useState(expandInit);
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        border: '1px solid #e3e8ee',
        borderTop: 'none',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#e3e8ee',
          padding: 0.7,
          paddingLeft: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>

        <Box onClick={() => setExpand((c) => !c)} sx={{ cursor: 'pointer' }}>
          {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>
      <Collapse in={expand}>
        <Box sx={{ p: 2 }}>
          <Yaml
            key={title}
            value={value}
            exclude={exclude}
            changelog={changelog}
          />
        </Box>
      </Collapse>
    </Box>
  );
}
