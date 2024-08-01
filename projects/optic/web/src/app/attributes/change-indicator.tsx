import { changeIndicatedColors } from '../constants';
import { Typography } from '@mui/material';

export const ChangeIndicator = ({
  changelog,
  fontSize,
}: {
  changelog?: any;
  fontSize?: number;
}) => {
  return changelog?.type === 'removed' ? (
    <div>
      <Typography
        variant="overline"
        sx={{
          color: changeIndicatedColors.removed,
          fontWeight: 'bold',
          fontSize,
        }}
      >
        Removed
      </Typography>
    </div>
  ) : changelog?.type === 'added' ? (
    <div>
      <Typography
        variant="overline"
        sx={{
          color: changeIndicatedColors.added,
          fontWeight: 'bold',
          fontSize,
        }}
      >
        Added
      </Typography>
    </div>
  ) : null;
};
