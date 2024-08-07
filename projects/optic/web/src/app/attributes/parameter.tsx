import Typography from '@mui/material/Typography';
import Required from './required';
import Description from './description';
import Box from '@mui/material/Box';
import BaseNode from './base-node';
import {
  od,
  or,
  anyChangelog,
  hasChanges,
  type Changelog,
  type InternalSpecParameter,
} from '../utils';
import { Issues } from '../issues/issues';
import { SummarizeSchema } from '../attributes/SummarizeSchema';
import { Yaml } from '../attributes/Yaml';
import { useState } from 'react';
import { SchemaDoc } from '../schemas/SchemaDoc';
import { SchemaContextProvider, addOpticPath } from '../schemas/SchemaContext';

export type ParameterProps = {
  isFirst?: boolean;
  expandAll?: boolean;
  parameter: InternalSpecParameter;
  changelog?: Changelog<InternalSpecParameter>;
};

export function Parameter(props: ParameterProps) {
  const { changelog, isFirst, parameter, expandAll } = props;
  const [expand, setExpand] = useState(
    expandAll ||
      hasChanges(parameter) ||
      changelog?.type === 'added' ||
      !!parameter[or]?.length
  );

  return (
    <BaseNode changelog={changelog}>
      <Box
        sx={{
          paddingTop: 1,
          paddingBottom: 1,
          borderTop: isFirst ? '1px solid #e3e8ee' : 'none',
          borderBottom: '1px solid #e3e8ee',
        }}
        style={{ paddingLeft: 4, paddingRight: 3 }}
      >
        {/*summary row*/}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={() => setExpand((e) => !e)}
        >
          <Typography variant="subtitle1">
            {parameter.in ? (
              <>
                <Box
                  component="span"
                  sx={{
                    py: 0.2,
                    px: 0.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.400',
                    color: 'grey.700',
                    fontWeight: 'light',
                    mr: 0.5,
                    textTransform: 'capitalize',
                  }}
                >
                  {parameter.in}
                </Box>{' '}
              </>
            ) : null}
            {parameter.name}
          </Typography>
          <Required
            value={parameter.required}
            changelog={anyChangelog(parameter[od], 'required')}
          />
          <div style={{ flex: 1 }} />
          <SummarizeSchema schema={parameter.schema} />
        </Box>
        {!expand ? null : (
          <Box>
            <Description
              value={parameter.description}
              changelog={anyChangelog(parameter[od], 'description')}
            />
            {Object.keys(parameter.misc).length > 0 && (
              <Yaml value={parameter.misc} expandAll={expandAll} />
            )}
            {parameter.schema?.polymorphicKey === null &&
            parameter.schema.type !== 'primitive' ? (
              <SchemaContextProvider>
                <SchemaDoc
                  schema={addOpticPath(parameter.schema, '')}
                  expandAll={expandAll}
                />
              </SchemaContextProvider>
            ) : null}

            <Issues ruleResults={parameter[or]} />
          </Box>
        )}
      </Box>
    </BaseNode>
  );
}
