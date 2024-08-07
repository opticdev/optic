import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BaseNode from './base-node';
import { Yaml } from './Yaml';

type AnyAttributeProperties<T = any> = {
  name: string;
  value: T;
  changelog?: any;
  expandAll?: boolean;
};

export default function AnyAttribute({
  value,
  name,
  changelog,
  expandAll,
}: AnyAttributeProperties) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
      <Box>
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
          {name}:
        </Typography>
      </Box>

      <Box sx={{ ml: 0.4, flexGrow: 1 }}>
        <BaseNode>
          <Yaml value={value} changelog={changelog} expandAll={expandAll} />
        </BaseNode>
      </Box>
    </Box>
  );
}
