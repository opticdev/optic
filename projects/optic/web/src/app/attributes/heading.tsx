import Typography from '@mui/material/Typography';
import type { ComponentProps } from 'react';
import { TextDiff } from './text-diff';
import { changeBgColors } from '../constants';

type SubHeadingProps = {
  fallbackText?: string;
  variant: ComponentProps<typeof Typography>['variant'];
  value?: string | undefined;
  changelog?: any;
  /*
  Possible additions:
    - renderMarkdown
    - trimLines...
 */
};

export default function Subheading(props: SubHeadingProps) {
  const { value, fallbackText, variant, changelog } = props;

  if (!value && fallbackText)
    return <Typography variant={variant}>{fallbackText}</Typography>;

  return (
    <Typography
      variant={variant}
      sx={
        changelog?.type === 'added'
          ? { backgroundColor: changeBgColors.added }
          : changelog?.type === 'removed'
            ? { backgroundColor: changeBgColors.removed }
            : {}
      }
    >
      <TextDiff value={value} changelog={changelog} />
    </Typography>
  );
}
