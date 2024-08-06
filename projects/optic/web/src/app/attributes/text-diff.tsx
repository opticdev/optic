// @ts-ignore
import * as Diff from 'diff';
import { changeBgColors } from '../constants';
import Box from '@mui/material/Box';

export function TextDiff({
  value,
  changelog,
}: {
  value?: string;
  changelog?: any;
}) {
  const diffResults =
    changelog?.type === 'added'
      ? Diff.diffWordsWithSpace('', value || '', {})
      : changelog?.type === 'changed'
        ? Diff.diffWordsWithSpace(changelog.before || '', value || '', {})
        : changelog?.type === 'removed'
          ? Diff.diffWordsWithSpace(changelog.before || '', '', {})
          : Diff.diffWordsWithSpace(value || '', value || '', {});

  return (
    <Box
      component="span"
      sx={{
        whiteSpace: 'pre-wrap',
        fontWeight: 'inherit',
        fontSize: 'inherit',
        color: 'inherit',
      }}
    >
      {diffResults.map((segment: any, index: number) => {
        if (!segment.added && !segment.removed) {
          return <span key={index}>{segment.value}</span>;
        } else if (segment.added) {
          return (
            <span key={index} style={{ backgroundColor: changeBgColors.added }}>
              {segment.value}
            </span>
          );
        } else if (segment.removed) {
          return (
            <span
              key={index}
              style={{ backgroundColor: changeBgColors.removed }}
            >
              {segment.value}
            </span>
          );
        }
        return null;
      })}
    </Box>
  );
}
