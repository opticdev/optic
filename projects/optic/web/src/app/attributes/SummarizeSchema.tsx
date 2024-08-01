import {
  od,
  anyChangelog,
  mapChangelog,
  getPolymorphicKeyChangelog,
  UnnamedPolymorphic,
  type InternalSpecSchema,
  type ChangelogTree,
} from '../utils';
import { TextDiff } from './text-diff';
import { Box, Typography } from '@mui/material';
import { changeBgColors } from '../constants';
import type { ReactElement } from 'react';

const openBracket = '{';
const closedBracket = '}';

export const SummarizeSchema = ({
  schema,
}: {
  schema: InternalSpecSchema | undefined;
}) => {
  if (!schema) return <span>any</span>;
  let changelog = getPolymorphicKeyChangelog(schema);

  const items: ReactElement[] = [];
  if (schema.polymorphicKey !== null) {
    const label =
      schema.polymorphicKey === UnnamedPolymorphic ? '' : schema.polymorphicKey;
    items.push(
      <Box key="type" sx={{ display: 'flex', alignItems: 'stretch' }}>
        <TextDiff value={label} changelog={changelog} />
      </Box>
    );
  } else if (schema.type === 'object' || schema.type === 'array') {
    if (!changelog)
      changelog = mapChangelog(anyChangelog(schema[od], 'value'), (t) =>
        String(t)
      );
    items.push(
      <Box key="type" sx={{ display: 'flex', alignItems: 'stretch' }}>
        <TextDiff value={schema.value} changelog={changelog} />
      </Box>
    );
  } else if (schema.type === 'primitive') {
    if (!changelog) changelog = anyChangelog(schema[od], 'value');
    items.push(
      <Box key="type" sx={{ display: 'flex', alignItems: 'stretch' }}>
        <TextDiff value={String(schema.value)} changelog={changelog} />
      </Box>
    );
  }

  if (!items.length) {
    items.push(
      <span key="unknown">
        {openBracket}unknown{closedBracket}
      </span>
    );
  }

  return (
    <Typography
      variant="caption"
      sx={{ display: 'flex', flexShrink: 0, gap: 1 }}
    >
      {items}
    </Typography>
  );
};

export const Label = ({
  label,
  changelog,
}: {
  label: string;
  changelog?: ChangelogTree<any>;
}) => {
  return (
    <Box
      sx={
        changelog?.type === 'added'
          ? { backgroundColor: changeBgColors.added }
          : changelog?.type === 'removed'
            ? { backgroundColor: changeBgColors.removed }
            : {}
      }
    >
      {label}
    </Box>
  );
};
