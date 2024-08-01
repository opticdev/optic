import { Box } from '@mui/system';
import type { RuleResult } from '@useoptic/openapi-utilities';
import { Severity } from '@useoptic/openapi-utilities';
import Issue from './issue';

export const Issues = ({
  ruleResults,
}: {
  ruleResults?: RuleResult[] | undefined;
}) => {
  return ruleResults?.length ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
      {ruleResults.map((result, ix) => (
        <Issue
          message={result.name}
          error={result.error ?? ''}
          key={ix}
          docsLink={result.docsLink}
          severity={result.severity ?? Severity.Error}
        />
      ))}
    </Box>
  ) : null;
};
