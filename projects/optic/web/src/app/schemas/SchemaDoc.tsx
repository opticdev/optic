import {
  od,
  or,
  anyChangelog,
  arrayWithRemovedItems,
  hasChanges,
  getPolymorphicKeyChangelog,
  objectWithRemovedItems,
  UnnamedPolymorphic,
  type InternalSpecSchema,
  type Changelog,
} from '../utils';
import BaseNode from '../attributes/base-node';
import {
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Required from '../attributes/required';
import Description from '../attributes/description';
import AnyAttribute from '../attributes/any-attribute';
import { Issues } from '../issues/issues';
import { Yaml } from '../attributes/Yaml';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';
import {
  getDefaultPolymorphicIndex,
  op,
  useSchemaContext,
  type WithOpticPath,
} from './SchemaContext';
import { SummarizeSchema } from '../attributes/SummarizeSchema';
import { TextDiff } from '../attributes/text-diff';
import { changeIndicatedColors } from '../constants';

export const SchemaDoc = ({
  schema,
  embedded,
  expandAll,
}: {
  schema: WithOpticPath<InternalSpecSchema>;
  embedded?: boolean;
  expandAll?: boolean;
}) => {
  const { polymorphicChoices } = useSchemaContext();
  const polymorphicKeyChangelog = getPolymorphicKeyChangelog(schema);
  if (schema.polymorphicKey !== null) {
    const schemas = schema.schemas;
    const polymorphicIndex = getDefaultPolymorphicIndex(
      schema[op],
      schemas,
      polymorphicChoices
    );

    return (
      <>
        <TextDiff
          value={
            schema.polymorphicKey === UnnamedPolymorphic
              ? ''
              : `${schema.polymorphicKey} variant`
          }
          changelog={polymorphicKeyChangelog}
        />
        <PolymorphicChoices
          schema={schema}
          polymorphicIndex={polymorphicIndex}
        />

        <Description
          value={schema.title}
          variant="subtitle1"
          changelog={anyChangelog(schema[od], 'title')}
        />
        <Description
          value={schema.description}
          changelog={anyChangelog(schema[od], 'description')}
        />

        <SchemaDoc
          schema={schemas[polymorphicIndex] as WithOpticPath<any>}
          embedded={embedded}
          expandAll={expandAll}
        />
        {Object.keys(schema.misc).length > 0 && (
          <Yaml value={schema.misc} expandAll={expandAll} />
        )}
        <Issues ruleResults={schemas[polymorphicIndex]?.[or]} />
      </>
    );
  } else if (schema.type === 'object') {
    const properties = objectWithRemovedItems(schema.properties);
    const propertiesEntries = Object.entries(properties);
    const additionalPropertiesChangelog = anyChangelog(
      schema[od],
      'additionalProperties'
    );

    const additionalProperties =
      schema.additionalProperties ??
      (additionalPropertiesChangelog?.type === 'removed'
        ? additionalPropertiesChangelog.before
        : null);

    return (
      <>
        {polymorphicKeyChangelog && (
          <TextDiff value="object" changelog={polymorphicKeyChangelog} />
        )}
        {embedded ? null : (
          <>
            <Description
              value={schema.title}
              variant="subtitle1"
              changelog={anyChangelog(schema[od], 'title')}
            />
            <Description
              value={schema.description}
              changelog={anyChangelog(schema[od], 'description')}
            />
          </>
        )}

        <Box
          sx={{
            borderTop: embedded ? 0 : 1,
            borderBottom: embedded ? 0 : 1,
            borderColor: 'divider',
          }}
        >
          {propertiesEntries.map(([key, value], ix) => {
            const changelog = anyChangelog(properties[od], key);

            return (
              <SchemaObjectRow
                schema={value as any}
                name={key}
                key={key}
                last={
                  ix === propertiesEntries.length - 1 &&
                  schema.additionalProperties == null
                }
                changelog={changelog}
                required={value.required}
                requiredChangelog={anyChangelog(value[od], 'required')}
                expandAll={expandAll}
              />
            );
          })}
          {additionalProperties != null ? (
            typeof additionalProperties === 'boolean' ? (
              <BaseNode changelog={additionalPropertiesChangelog}>
                <Box
                  sx={{
                    paddingTop: 1.2,
                    paddingBottom: 1.2,
                    px: 0.5,
                  }}
                >
                  <Typography variant="subtitle1">
                    <Box
                      component="span"
                      sx={{
                        fontFamily: 'Inconsolata, monospace',
                      }}
                    >
                      [.*]
                    </Box>
                    <Box sx={{ color: 'grey.500', ml: 1 }} component="span">
                      {additionalProperties ? 'any' : 'none'}
                    </Box>
                  </Typography>
                </Box>
              </BaseNode>
            ) : (
              <SchemaObjectRow
                schema={additionalProperties}
                changelog={additionalPropertiesChangelog}
                name={
                  <Box
                    component="span"
                    sx={{
                      fontFamily: 'Inconsolata, monospace',
                    }}
                  >
                    [.*]
                  </Box>
                }
                last={true}
                expandAll={expandAll}
              />
            )
          ) : null}
        </Box>
        {Object.keys(schema.misc).length > 0 && (
          <Yaml value={schema.misc} expandAll={expandAll} />
        )}
      </>
    );
  } else if (schema.type === 'array') {
    return (
      <>
        {polymorphicKeyChangelog && (
          <TextDiff value="array" changelog={polymorphicKeyChangelog} />
        )}
        {embedded ? null : (
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                color: '#697386',
              }}
            >
              Array items:
            </Box>
            <Description
              value={schema.title}
              variant="subtitle1"
              changelog={anyChangelog(schema[od], 'title')}
            />
            <Description
              value={schema.description}
              changelog={anyChangelog(schema[od], 'description')}
            />
          </Box>
        )}
        <SchemaDoc
          schema={schema.items as WithOpticPath<InternalSpecSchema>}
          embedded={embedded}
          expandAll={expandAll}
        />
        {Object.keys(schema.misc).length > 0 && (
          <Yaml value={schema.misc} expandAll={expandAll} />
        )}
        <Issues ruleResults={schema.items?.[or]} />
      </>
    );
  } else {
    return (
      <>
        {polymorphicKeyChangelog && (
          <TextDiff value={schema.value} changelog={polymorphicKeyChangelog} />
        )}
        <Description
          value={schema.title}
          variant="subtitle1"
          changelog={anyChangelog(schema[od], 'title')}
        />
        <Description
          value={schema.description}
          changelog={anyChangelog(schema[od], 'description')}
        />
        <Yaml
          value={{
            type: schema.value,
            ...schema.misc,
          }}
          expandAll={expandAll}
        />
      </>
    );
  }
};

// Field items in an object
function SchemaObjectRow(props: {
  name: string | ReactElement;
  required?: boolean;
  schema: WithOpticPath<InternalSpecSchema>;
  changelog?: Changelog<InternalSpecSchema>;
  requiredChangelog?: Changelog<boolean>;
  last?: boolean;
  expandAll?: boolean;
}) {
  const { schema } = props;
  const unreservedAttributes = objectWithRemovedItems(schema.misc);

  const { polymorphicChoices } = useSchemaContext();
  const polymorphicSchemas =
    schema.polymorphicKey === null ? null : schema.schemas;
  const polymorphicIndex = polymorphicSchemas
    ? getDefaultPolymorphicIndex(
        schema[op],
        polymorphicSchemas,
        polymorphicChoices
      )
    : undefined;

  const selectedPolymorphicSchema = polymorphicSchemas?.[polymorphicIndex ?? 0];

  return (
    <BaseNode changelog={props.changelog}>
      <Box
        sx={{
          paddingTop: 1.2,
          paddingBottom: 1.2,
          borderBottom: props.last ? '0' : '1px solid #e3e8ee',
          pl: 1,
          pr: 0.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 1,
            overflowX: 'scroll',
          }}
        >
          <Typography variant="subtitle1">{props.name}</Typography>
          <SummarizeSchema schema={props.schema} />
          <Required
            value={props.required ?? false}
            changelog={props.requiredChangelog}
          />
          {schema.polymorphicKey !== null && polymorphicIndex !== undefined && (
            <PolymorphicChoices
              schema={schema}
              polymorphicIndex={polymorphicIndex}
            />
          )}
        </Box>
        <Description
          value={schema.title}
          variant="subtitle1"
          changelog={anyChangelog(schema[od], 'title')}
        />
        <Description
          value={schema.description}
          changelog={anyChangelog(schema[od], 'description')}
        />
        {Object.entries(unreservedAttributes).map(([name, value]) => {
          return (
            <AnyAttribute
              key={name}
              name={name}
              value={value}
              changelog={anyChangelog(unreservedAttributes[od], name)}
              expandAll={props.expandAll}
            />
          );
        })}
        {schema.polymorphicKey === null ? (
          schema.type === 'object' &&
          Object.keys(schema.properties).length > 0 ? (
            <ChildAttributes schema={schema} expandAll={props.expandAll} />
          ) : schema.type === 'array' ? (
            <ChildAttributes
              schema={schema.items as WithOpticPath<InternalSpecSchema>}
              expandAll={props.expandAll}
            />
          ) : null
        ) : null}

        {schema.polymorphicKey !== null && selectedPolymorphicSchema ? (
          <>
            <SummarizeSchema schema={selectedPolymorphicSchema} />
            <Description
              value={selectedPolymorphicSchema.title}
              variant="subtitle1"
              changelog={anyChangelog(schema[od], 'title')}
            />
            <Description
              value={selectedPolymorphicSchema.description}
              changelog={anyChangelog(
                selectedPolymorphicSchema[od],
                'description'
              )}
            />
            {selectedPolymorphicSchema.polymorphicKey === null ? (
              selectedPolymorphicSchema.type === 'object' ||
              selectedPolymorphicSchema.type === 'array' ? (
                <ChildAttributes
                  schema={
                    selectedPolymorphicSchema as WithOpticPath<InternalSpecSchema>
                  }
                  expandAll={props.expandAll}
                />
              ) : (
                Object.entries(
                  objectWithRemovedItems(selectedPolymorphicSchema.misc)
                ).map(([name, value]) => {
                  return (
                    <AnyAttribute
                      key={name}
                      name={name}
                      value={value}
                      changelog={anyChangelog(
                        selectedPolymorphicSchema.misc[od],
                        name
                      )}
                      expandAll={props.expandAll}
                    />
                  );
                })
              )
            ) : (
              <SchemaDoc
                schema={
                  selectedPolymorphicSchema as WithOpticPath<InternalSpecSchema>
                }
                embedded
                expandAll={props.expandAll}
              />
            )}
          </>
        ) : null}

        <Issues ruleResults={schema[or]} />
        {schema.polymorphicKey === null && schema.type === 'array' && (
          <Issues ruleResults={(schema as any).items?.[or]} />
        )}
        {selectedPolymorphicSchema && (
          <Issues ruleResults={selectedPolymorphicSchema[or]} />
        )}
      </Box>
    </BaseNode>
  );
}

function truncateTitle(title: string): string {
  return title.length > 15 ? `${title.slice(0, 15)}...` : title;
}

function PolymorphicChoices({
  polymorphicIndex,
  schema,
}: PropsWithChildren<{
  polymorphicIndex: number;
  schema: WithOpticPath<Exclude<InternalSpecSchema, { polymorphicKey: null }>>;
}>) {
  const { setPolymorphicChoices } = useSchemaContext();
  const path = schema[op];

  const schemas = arrayWithRemovedItems(schema.schemas);

  return (
    <ToggleButtonGroup
      size="small"
      value={polymorphicIndex}
      sx={{ ml: 1, my: 1 }}
      onChange={(_, i) => {
        if (i !== null)
          setPolymorphicChoices((m) => {
            const newMap = new Map<string, number>(m);
            newMap.set(path, i);
            return newMap;
          });
      }}
      exclusive
    >
      {schemas.map((s, i) => {
        const changelog = anyChangelog((schema.schemas as any)[od], String(i));
        const change =
          changelog?.type === 'added'
            ? 'added'
            : changelog?.type === 'removed'
              ? 'removed'
              : null;

        return (
          <ToggleButton
            key={i}
            value={i}
            sx={{
              textTransform: 'unset',
              fontWeight: 400,
              px: 1,
              ':disabled': {
                color: 'red',
                backgroundColor: changeIndicatedColors.removed,
                textDecoration: 'line-through',
              },
              ...(change === 'added'
                ? { color: changeIndicatedColors.added }
                : {}),
            }}
            color={
              change === 'added'
                ? 'success'
                : change === 'removed'
                  ? 'error'
                  : undefined
            }
            disabled={change === 'removed'}
          >
            {s.title
              ? truncateTitle(s.title)
              : s.polymorphicKey !== null
                ? s.polymorphicKey === UnnamedPolymorphic
                  ? ''
                  : s.polymorphicKey
                : s.type === 'primitive'
                  ? s.value
                  : s.type}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

const ChildAttributes = ({
  schema,
  expandAll,
  changelog,
}: {
  schema: WithOpticPath<InternalSpecSchema>;
  expandAll?: boolean;
  changelog?: Changelog<InternalSpecSchema>;
}) => {
  const [showChildAttributes, setShowChildAttributes] = useState(() =>
    hasChanges(schema)
  );
  const before = changelog?.type === 'removed' ? changelog.before : undefined;
  const schemaOrRemovedSchema = schema ?? before;
  const buttonText = `${showChildAttributes ? 'Hide' : 'Show'} ${
    schema.polymorphicKey === null && schema.type === 'array'
      ? 'array items'
      : 'child attributes'
  }`;
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={showChildAttributes ? <RemoveIcon /> : <AddIcon />}
        onClick={() => setShowChildAttributes((s) => !s)}
        sx={{
          mt: 1,
          color: '#697386',
          fontWeight: 'regular',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'divider',
          },
          borderBottomLeftRadius: showChildAttributes ? 0 : 'default',
          borderBottomRightRadius: showChildAttributes ? 0 : 'default',
          width: showChildAttributes ? '100%' : 'auto',
          justifyContent: 'flex-start',
          py: 0,
        }}
      >
        {buttonText}
      </Button>
      {showChildAttributes && (
        <BaseNode changelog={changelog}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              borderTop: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <SchemaDoc
              schema={schemaOrRemovedSchema}
              embedded
              expandAll={expandAll}
            />
          </Box>
        </BaseNode>
      )}
    </>
  );
};
