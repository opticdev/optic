import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import {
  Info as InfoIcon,
  WarningAmber as WarningAmberIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

import { blue, yellow } from '@mui/material/colors';
import { Severity, sevToText } from '@useoptic/openapi-utilities';

export default function Issue(props: {
  error: string;
  message: string;
  docsLink?: string;
  severity: Severity;
}) {
  const color =
    props.severity === Severity.Error
      ? '#da5f73'
      : props.severity === Severity.Warn
        ? yellow[700]
        : blue[500];
  const backgroundColor =
    props.severity === Severity.Error
      ? '#faeded'
      : props.severity === Severity.Warn
        ? yellow[50]
        : blue[50];
  return (
    <Box
      sx={{
        backgroundColor,
        display: 'flex',
        border: `2px dotted ${color}`,
      }}
    >
      <Box sx={{ marginLeft: 1, marginRight: 1, marginTop: 1.7 }}>
        {props.severity === Severity.Error ? (
          <ErrorIcon sx={{ color }} />
        ) : props.severity === Severity.Warn ? (
          <WarningAmberIcon sx={{ color }} />
        ) : (
          <InfoIcon sx={{ color }} />
        )}
      </Box>
      <Box sx={{ padding: 1, flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ '&:first-letter': { textTransform: 'capitalize' } }}
        >
          [{sevToText(props.severity)}] {props.error}
        </Typography>
        <Typography
          variant="caption"
          component="p"
          sx={{ '&:first-letter': { textTransform: 'capitalize' } }}
        >
          {props.message}
        </Typography>
        {props.docsLink && (
          <Typography variant="caption" component="p">
            Read more in the{' '}
            <Link target="_blank" href={props.docsLink}>
              API Style Guide
            </Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
