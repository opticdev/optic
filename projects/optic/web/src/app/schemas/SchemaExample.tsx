import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import type { ReactElement } from 'react';
import {
  getDefaultPolymorphicIndex,
  op,
  useSchemaContext,
  type WithOpticPath,
} from './SchemaContext';
import {
  UnnamedPolymorphic,
  type InternalSpecSchema,
  type InternalSpecSchemaField,
} from '../utils';

const indentation = '  ';
const punctuationGrey = 'grey.500';

export const SchemaExample = ({
  value,
  title,
}: {
  value: WithOpticPath<InternalSpecSchema>;
  title: string;
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'grey.50',
        border: '1px solid #e3e8ee',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#e3e8ee',
          padding: 0.7,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <Box sx={{ p: 1, maxHeight: '70vh', overflowY: 'scroll' }}>
        <ExampleNode value={value} indentLevel={0} last />
      </Box>
    </Box>
  );
};

const StringExample = ({
  example,
  enumList,
}: {
  example?: any;
  enumList?: any[];
}) => {
  return (
    <Box component="span" sx={{ color: '#09825d' }}>
      {example
        ? `"${example}"`
        : enumList && enumList.length
          ? `"${enumList[0]}"`
          : '""'}
    </Box>
  );
};

const NumberExample = ({ example }: { example?: any }) => (
  <Box component="span" sx={{ color: '#e56f4a' }}>
    {example != null ? String(example) : 0}
  </Box>
);

const BooleanExample = ({ example }: { example?: any }) => (
  <Box component="span" sx={{ color: '#3a97d4', fontWeight: 'bold' }}>
    {String(example ?? true)}
  </Box>
);

const NullExample = () => (
  <Box component="span" sx={{ color: 'grey.500' }}>
    null
  </Box>
);

const UnknownExample = ({ example }: { example?: any }) => (
  <Box component="span">{String(example)}</Box>
);

const Example = ({
  schema,
}: {
  schema: WithOpticPath<
    Extract<InternalSpecSchema, { polymorphicKey: null; type: 'primitive' }>
  >;
}) => {
  const { examples, value: type, misc } = schema;
  const example = examples[0];

  return example === null || (example === undefined && type === 'null') ? (
    <NullExample />
  ) : typeof example === 'string' ||
    (example === undefined && type === 'string') ? (
    <StringExample example={example} enumList={misc.enum} />
  ) : typeof example === 'number' ||
    (example === undefined && (type === 'number' || type === 'integer')) ? (
    <NumberExample example={example} />
  ) : typeof example === 'boolean' ||
    (example === undefined && type === 'boolean') ? (
    <BooleanExample example={example} />
  ) : (
    <UnknownExample example={type} />
  );
};

const MAX_ITERATIONS = 50;

function getSchemaFromPolymorphic(
  schema: WithOpticPath<InternalSpecSchema>,
  polymorphicChoices: Map<string, number>
) {
  let current = 0;
  while (
    current < MAX_ITERATIONS &&
    (schema.polymorphicKey !== null ||
      schema.polymorphicKey === UnnamedPolymorphic)
  ) {
    const index = getDefaultPolymorphicIndex(
      schema[op],
      schema.schemas,
      polymorphicChoices
    );
    schema = schema.schemas[index] as WithOpticPath<InternalSpecSchema>;
  }

  return schema as WithOpticPath<
    Exclude<
      InternalSpecSchema,
      { polymorphicKey: string | typeof UnnamedPolymorphic }
    >
  >;
}

const ExampleNode = ({
  value,
  indentLevel = 0,
  property,
  last,
}: {
  value: WithOpticPath<InternalSpecSchema>;
  indentLevel: number;
  property?: string;
  last?: boolean;
}) => {
  const { polymorphicChoices } = useSchemaContext();
  const lines: ReactElement[] = [];
  if (
    value.polymorphicKey !== null ||
    value.polymorphicKey === UnnamedPolymorphic
  ) {
    value = getSchemaFromPolymorphic(value, polymorphicChoices);
  }

  if (value.type === 'array') {
    if (
      value.items.polymorphicKey === null &&
      value.items.type === 'primitive' &&
      value.items.value === 'unknown'
    ) {
      lines.push(
        <ExampleLine
          prefix={property ?? null}
          value={
            <Box component="span" sx={{ color: punctuationGrey }}>
              []{last ? '' : ','}
            </Box>
          }
          key="openclosedsquarebrace"
          indentLevel={indentLevel}
        />
      );
    } else {
      lines.push(
        <ExampleLine
          prefix={property ?? null}
          value={
            <Box component="span" sx={{ color: punctuationGrey }}>
              [
            </Box>
          }
          key="opensquarebrace"
          indentLevel={indentLevel}
        />
      );
      lines.push(
        <div key="array">
          <ExampleNode
            value={value.items as WithOpticPath<InternalSpecSchema>}
            indentLevel={indentLevel + 1}
            last
          />
        </div>
      );
      lines.push(
        <ExampleLine
          value={
            <Box component="span" sx={{ color: punctuationGrey }}>
              ]{last ? '' : ','}
            </Box>
          }
          key="closedsquarebrace"
          indentLevel={indentLevel}
        />
      );
    }
  } else if (value.type === 'object') {
    const entries = Object.entries(value.properties);
    if (entries.length === 0) {
      lines.push(
        <ExampleLine
          prefix={property ?? null}
          value={
            <Box component="span" sx={{ color: punctuationGrey }}>
              {`{}${last ? '' : ','}`}
            </Box>
          }
          key="openclosedbrace"
          indentLevel={indentLevel}
        />
      );
    } else {
      lines.push(
        <ExampleLine
          prefix={property ?? null}
          value={
            <Box component="span" sx={{ color: punctuationGrey }}>
              {`{`}
            </Box>
          }
          key="openbrace"
          indentLevel={indentLevel}
        />
      );
      for (const [ix, [key, property]] of Object.entries(entries)) {
        lines.push(
          <ExampleNode
            key={`${key}-key`}
            value={property as WithOpticPath<InternalSpecSchemaField>}
            property={key}
            indentLevel={indentLevel + 1}
            last={Number(ix) === Object.keys(value.properties).length - 1}
          />
        );
      }
      lines.push(
        <ExampleLine
          value={
            <Box component="span" sx={{ color: punctuationGrey }}>
              {`}${last ? '' : ','}`}
            </Box>
          }
          key={`closedbrace`}
          indentLevel={indentLevel}
        />
      );
    }
  } else {
    lines.push(
      <ExampleLine
        prefix={property ?? null}
        value={
          <>
            <Example schema={value} />
            {last ? null : ','}
          </>
        }
        key="primitive"
        indentLevel={indentLevel}
      />
    );
  }
  return <div>{lines}</div>;
};

const ExampleLine = ({
  value,
  prefix,
  indentLevel,
}: {
  value: string | ReactElement;
  prefix?: string | null;
  indentLevel: number;
}) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Typography
        component="div"
        sx={{
          fontFamily: 'Inconsolata, monospace',
          display: 'flex',
          whiteSpace: 'pre-wrap',
          flexGrow: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            overflowWrap: 'anywhere',
            wordWrap: 'anywhere',
          }}
        >
          {indentation.repeat(indentLevel)}
          {prefix ? (
            <>
              <Box component="span" sx={{ color: '#4f566b' }} fontWeight="bold">
                "{prefix}"
              </Box>
              <Box component="span" sx={{ color: punctuationGrey }}>
                :{' '}
              </Box>
            </>
          ) : null}
          <Box component="span">{value}</Box>
        </Box>
      </Typography>
    </Box>
  );
};
