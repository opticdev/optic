import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Typography from '@mui/material/Typography';

export default function PathUrl(props: {
  pathPattern: string;
  method: string;
}) {
  const Title = (
    <Typography
      component="span"
      variant="h5"
      sx={{
        fontWeight: 600,
        marginLeft: 0.5,
      }}
    >
      {props.pathPattern}
    </Typography>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
        flexShrink: 1,
      }}
    >
      <Chip
        sx={{
          backgroundColor: 'white',
          fontWeight: 700,
          textTransform: 'uppercase',
          border: 1,
          borderColor: 'divider',
        }}
        label={props.method}
        size="small"
      />
      {Title}
    </Box>
  );
}
