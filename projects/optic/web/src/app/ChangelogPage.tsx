import { Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  diff,
  type RuleResult,
  type FlatOpenAPIV2,
  type FlatOpenAPIV3,
} from '@useoptic/openapi-utilities';
import {
  allUnreserved,
  anyChangelog,
  hasChanges,
  objectWithRemovedItems,
  buildChangelogTree,
  or,
  od,
  type ChangelogTree,
  attachRuleResults,
  type InternalSpec,
  addOpticResultsToOriginal,
} from './utils';
import { TextDiff } from './attributes/text-diff';
import { ChangelogLayout } from './ChangelogLayout';
import AnyAttribute from './attributes/any-attribute';
import { Issues } from './issues/issues';
const infoReservedKeys = ['title', 'version'];

const getChangelogOperations = (
  changelog: InternalSpec,
  originalDoc: ChangelogTree<FlatOpenAPIV2.Document | FlatOpenAPIV3.Document>
) => {
  const allPaths = objectWithRemovedItems(changelog.endpoints);

  const operations = Object.entries(allPaths)
    .filter(
      ([p, endpoint]) => hasChanges(endpoint) || anyChangelog(allPaths[od], p)
    )
    .map(([p, endpoint]) => {
      return {
        originalOp: (originalDoc.paths[endpoint.path] as any)?.[
          endpoint.method
        ],
        operation: endpoint,
        changelog: anyChangelog(allPaths[od], p),
      };
    });

  return operations;
};

export const ChangelogPage = ({
  base,
  head,
  results,
  showAnchors = true,
}: {
  base: {
    original: FlatOpenAPIV2.Document | FlatOpenAPIV3.Document;
    internal: InternalSpec;
  };
  head: {
    original: FlatOpenAPIV2.Document | FlatOpenAPIV3.Document;
    internal: InternalSpec;
  };
  results: RuleResult[];
  showAnchors?: boolean;
}) => {
  const originalDiffs = diff(base.original, head.original);
  const originalDoc = buildChangelogTree(
    base.original,
    head.original,
    originalDiffs
  );
  addOpticResultsToOriginal(originalDoc, results);
  const internalDiffs = diff(base.internal, head.internal);
  const internalDoc = buildChangelogTree(
    base.internal,
    head.internal,
    internalDiffs
  );
  attachRuleResults(internalDoc, results);

  const operations = getChangelogOperations(internalDoc, originalDoc);
  const { info, ...metadata } = internalDoc.metadata;
  const titleChangelog = anyChangelog((info as any)[od], 'title');
  const versionChangelog = anyChangelog((info as any)[od], 'version');
  const infoUnreservedAttributes = allUnreserved(info, infoReservedKeys);
  const docUnreservedAttributes = objectWithRemovedItems(metadata as any);

  return (
    <>
      <Box sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        <Box>
          <Typography variant="h4" sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextDiff value={info.title} changelog={titleChangelog} />
              <Box>version</Box>
              <TextDiff value={info.version} changelog={versionChangelog} />
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(docUnreservedAttributes).map(([name, value]) =>
              anyChangelog(internalDoc[od] as any, name) ? (
                <AnyAttribute
                  key={name}
                  name={name}
                  value={value}
                  changelog={anyChangelog(internalDoc[od] as any, name)}
                />
              ) : null
            )}
            <Issues ruleResults={internalDoc.metadata[or]} />
            {Object.entries(infoUnreservedAttributes).map(([name, value]) =>
              anyChangelog(info[od] as any, name) ? (
                <AnyAttribute
                  key={name}
                  name={name}
                  value={value}
                  changelog={anyChangelog(info[od] as any, name)}
                />
              ) : null
            )}
            <Issues ruleResults={info[or]} />
          </Box>
        </Box>
      </Box>
      <Divider />
      <ChangelogLayout operations={operations} showAnchors={showAnchors} />
    </>
  );
};
