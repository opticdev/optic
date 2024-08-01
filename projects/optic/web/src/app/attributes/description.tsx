import React from 'react';
import Typography from '@mui/material/Typography';
import { TextDiff } from './text-diff';
import Markdown from 'markdown-to-jsx';
import { changeBgColors } from '../constants';

export type DescriptionProps = {
  variant?: React.ComponentProps<typeof Typography>['variant'];
  value?: string | undefined;
  changelog?: any;
  /*
  Possible additions:
    - renderMarkdown
    - trimLines...
 */
};

export default function Description({
  value,
  variant,
  changelog,
}: DescriptionProps) {
  return value || changelog?.type === 'removed' ? (
    <Typography
      variant={variant || 'body1'}
      sx={{
        '& > p': { mt: 0.5 },
        fontWeight: '300',
        ...(changelog?.type === 'added'
          ? { backgroundColor: changeBgColors.added }
          : changelog?.type === 'removed'
            ? { backgroundColor: changeBgColors.removed }
            : {}),
      }}
      component="div"
    >
      {changelog?.type === 'changed' ? (
        <TextDiff value={value} changelog={changelog} />
      ) : (
        <Markdown>{value ?? ''}</Markdown>
      )}
    </Typography>
  ) : null;
}
