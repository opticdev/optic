import Typography from '@mui/material/Typography';
import { changeBgColors } from '../constants';

type RequiredProps = {
  value: boolean;
  changelog?: any;
};

export default function Required({ changelog, value }: RequiredProps) {
  const after = value;

  const before =
    changelog && changelog.type !== 'added'
      ? changelog.before
      : changelog?.type === 'added'
        ? false
        : value;

  if (before === true && after === false) {
    return (
      <Typography
        variant="caption"
        sx={{ display: 'flex', alignItems: 'stretch' }}
      >
        <span
          style={{
            textDecoration: 'line-through',
            backgroundColor: changeBgColors.removed,
          }}
        >
          required
        </span>
      </Typography>
    );
  } else if (before === false && after === true) {
    return (
      <Typography
        variant="caption"
        sx={{ display: 'flex', alignItems: 'stretch' }}
      >
        <span
          style={{
            textDecoration: 'line-through',
            backgroundColor: changeBgColors.removed,
          }}
        >
          optional
        </span>
        <span style={{ marginLeft: 4, backgroundColor: changeBgColors.added }}>
          required
        </span>
      </Typography>
    );
  } else {
    return after ? (
      <Typography
        variant="caption"
        sx={{ display: 'flex', alignItems: 'stretch' }}
      >
        required
      </Typography>
    ) : null;
  }
}
