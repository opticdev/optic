import { makeStyles, darken } from '@material-ui/core';
import {
  AddedGreenBackground,
  AddedGreen,
  ChangedYellow,
  ChangedYellowBackground,
  RemovedRed,
  RemovedRedBackground,
} from '<src>/styles';

// TODO generalize this style and move this into theme
export const useChangelogStyles = makeStyles(() => ({
  added: {
    backgroundColor: AddedGreenBackground,
    borderLeft: `2px solid ${AddedGreen}`,
    '&.Mui-focusVisible, &:hover': {
      backgroundColor: darken(AddedGreenBackground, 0.2),
    },
  },
  updated: {
    backgroundColor: ChangedYellowBackground,
    borderLeft: `2px solid ${ChangedYellow}`,
    '&.Mui-focusVisible, &:hover': {
      backgroundColor: darken(AddedGreenBackground, 0.2),
    },
  },
  removed: {
    backgroundColor: RemovedRedBackground,
    borderLeft: `2px solid ${RemovedRed}`,
    '&.Mui-focusVisible, &:hover': {
      backgroundColor: darken(AddedGreenBackground, 0.2),
    },
  },
}));
