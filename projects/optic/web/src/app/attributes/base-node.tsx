import type { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import { changeBgColors } from '../constants';

export default function BaseNode(
  props: PropsWithChildren<{
    changelog?: {
      type: 'added' | 'changed' | 'removed';
    };
    inheritedChange?: 'added' | 'removed' | 'changed';
    noBg?: boolean;
    radius?: boolean;
    large?: boolean;
  }>
) {
  const { changelog } = props;
  const wasAdded =
    props.inheritedChange === 'added' || changelog?.type === 'added';
  const wasRemoved =
    props.inheritedChange === 'removed' || changelog?.type === 'removed';
  const wasChanged =
    props.inheritedChange === 'changed' || changelog?.type === 'changed';

  const bgColor = props.noBg
    ? 'transparent'
    : wasAdded
      ? changeBgColors.added
      : wasRemoved
        ? changeBgColors.removed
        : wasChanged
          ? changeBgColors.changed
          : 'transparent';

  return (
    <Box
      sx={{
        backgroundColor: bgColor,
      }}
    >
      {props.children}
    </Box>
  );
}
