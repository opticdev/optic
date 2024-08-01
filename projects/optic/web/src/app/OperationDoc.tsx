import { Grid, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Description from './attributes/description';
import Subheading from './attributes/heading';
import AnyAttribute from './attributes/any-attribute';
import { changeIndicatedColors } from './constants';
import {
  od,
  or,
  objectWithRemovedItems,
  objectPropWithChangelog,
  anyChangelog,
  getOperationId,
  hasChanges,
  type Changelog,
  type InternalSpecEndpoint,
  type InternalSpecRequestBody,
  type InternalSpecResponse,
  type InternalSpecSchema,
} from './utils';

import { Parameter } from './attributes/parameter';
import { useState } from 'react';
import type { ReactElement, PropsWithChildren } from 'react';
import { ChangeIndicator } from './attributes/change-indicator';
import { Issues } from './issues/issues';
import { SchemaDoc } from './schemas/SchemaDoc';
import { SchemaExample } from './schemas/SchemaExample';
import BaseNode from './attributes/base-node';
import { Yaml } from './attributes/Yaml';
import { SchemaContextProvider, addOpticPath } from './schemas/SchemaContext';
import Required from './attributes/required';

export type OperationDocProps = {
  operation: InternalSpecEndpoint;
  changelog?: Changelog<InternalSpecEndpoint>;
  expandAll?: boolean;
  showAnchors: boolean;
};

function ChangelogBox({
  children,
  changelog,
  sx,
}: PropsWithChildren<{
  changelog?: Changelog<any>;
  sx?: React.ComponentProps<typeof Box>['sx'];
}>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...(changelog?.type === 'added'
          ? {
              borderLeft: 5,
              borderColor: changeIndicatedColors.added,
              marginLeft: '-5px',
            }
          : changelog?.type === 'removed'
            ? {
                borderLeft: 5,
                borderColor: changeIndicatedColors.removed,
                marginLeft: '-5px',
              }
            : {}),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export const OperationDoc = ({
  operation,
  expandAll,
  showAnchors,
}: OperationDocProps) => {
  const {
    description,
    responses: rawResponses,
    summary,
    method,
    path: pathPattern,
  } = operation;

  const operationId = getOperationId({ method, pathPattern });

  const diffs = operation[od];
  const unreservedAttributes = objectWithRemovedItems(operation.misc);
  const allResponses = objectWithRemovedItems(rawResponses ?? {});
  const responses = Object.keys(allResponses).sort();

  const combinedParameters = objectWithRemovedItems(operation.parameters);
  const [expandParameters, setExpandParameters] = useState(
    expandAll || hasChanges(combinedParameters)
  );

  const [requestBodyCombined, requestBodyChangelog] = objectPropWithChangelog(
    operation,
    'requestBody'
  );

  const headerItems: ReactElement[] = [];

  if (summary !== undefined || diffs?.removed?.summary) {
    headerItems.push(
      <Subheading
        key="summary"
        variant="h3"
        value={summary}
        changelog={anyChangelog(diffs, 'summary')}
      />
    );
  }

  if (description !== undefined || diffs?.removed?.description)
    headerItems.push(
      <Box key="description">
        <Description
          variant="body2"
          value={description}
          changelog={anyChangelog(diffs, 'description')}
        />
      </Box>
    );

  if (Object.keys(unreservedAttributes).length > 0)
    headerItems.push(
      <Box key="unreserved">
        <Yaml value={unreservedAttributes} expandAll={expandParameters} />
      </Box>
    );

  if (operation[or]?.length) {
    headerItems.push(<Issues ruleResults={operation[or]} key="issues" />);
  }

  return (
    <Box sx={{ p: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
      {headerItems.length > 0 ? (
        <DocGrid
          leftChildren={
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              {headerItems}
            </Box>
          }
        />
      ) : null}

      {requestBodyCombined || Object.keys(combinedParameters).length ? (
        <Box>
          <Typography
            sx={{ marginBottom: 2, color: 'grey.500' }}
            variant="overline"
          >
            Request
          </Typography>
          {Object.keys(combinedParameters).length ? (
            <DocGrid
              leftChildren={
                <BaseNode>
                  <Box sx={{ marginBottom: expandParameters ? 3 : 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                      onClick={() => setExpandParameters((e) => !e)}
                    >
                      Parameters
                      {expandParameters ? null : (
                        <Box component="span" sx={{ color: 'grey.600' }}>
                          …
                        </Box>
                      )}
                    </Typography>

                    {expandParameters ? (
                      <>
                        {Object.entries(combinedParameters ?? {})
                          .sort(([, p1], [, p2]) => sortParameters(p1, p2))
                          .map(([key, p], i) => (
                            <Parameter
                              key={key}
                              parameter={p}
                              isFirst={i === 0}
                              expandAll={expandAll}
                              changelog={anyChangelog(
                                combinedParameters[od],
                                key
                              )}
                            />
                          ))}
                      </>
                    ) : null}
                  </Box>
                </BaseNode>
              }
              rightChildren={<span></span>}
            />
          ) : null}

          {requestBodyCombined ? (
            <RequestBody
              operationId={operationId}
              requestBody={requestBodyCombined}
              changelog={requestBodyChangelog}
              expandAll={expandAll}
              showAnchors={showAnchors}
            />
          ) : null}
        </Box>
      ) : null}

      {responses && responses.length ? (
        <Box>
          <Typography
            sx={{ marginBottom: 2, color: 'grey.500' }}
            variant="overline"
          >
            Responses
          </Typography>
          {responses.map((statusCode) => {
            return (
              <ResponseStatus
                key={statusCode}
                operationId={operationId}
                statusCode={statusCode}
                responseBody={allResponses[statusCode]}
                changelog={anyChangelog(allResponses?.[od], statusCode)}
                expandAll={expandAll}
                showAnchors={showAnchors}
              />
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

function ResponseStatus(props: {
  operationId: string;
  statusCode: string;
  responseBody: InternalSpecResponse;
  changelog?: Changelog<InternalSpecResponse>;
  expandAll?: boolean;
  showAnchors: boolean;
}) {
  const { responseBody, changelog, expandAll } = props;
  const { content, description } = responseBody;
  const diffs = responseBody[od];

  const unreservedAttributes = objectWithRemovedItems(responseBody.misc);
  const headers = objectWithRemovedItems(responseBody.headers);
  const allContents = objectWithRemovedItems(content);
  const [expand, setExpand] = useState(
    expandAll || hasChanges(responseBody) || changelog?.type === 'added'
  );

  return (
    <ChangelogBox changelog={changelog}>
      <Box>
        <ChangeIndicator changelog={changelog} />
        <Box
          sx={{
            marginBottom: expand ? 2 : 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
            onClick={() => setExpand((e) => !e)}
          >
            {props.statusCode} Response
            {expand ? null : (
              <Box component="span" sx={{ color: 'grey.600' }}>
                …
              </Box>
            )}
          </Typography>
        </Box>

        {expand ? (
          <>
            <Description
              variant="body2"
              value={description}
              changelog={anyChangelog(diffs, 'description')}
            />
            {Object.keys(headers).length > 0 ? (
              <Grid
                container
                columns={{ xs: 1, sm: 1, md: 2 }}
                columnSpacing={5}
              >
                <Grid xs={1} sx={{ flex: 1 }} item>
                  {Object.entries(headers).map(([name, header], i) => (
                    <Parameter
                      key={name}
                      parameter={header}
                      isFirst={i === 0}
                      expandAll={expandAll}
                      changelog={anyChangelog(headers[od], name)}
                    />
                  ))}
                </Grid>
                <Grid xs={1} sx={{ flex: 1 }} item></Grid>
              </Grid>
            ) : null}

            {Object.keys(unreservedAttributes).length ? (
              <Box sx={{ marginTop: 1 }}>
                {Object.entries(unreservedAttributes).map(([name, value]) => {
                  return (
                    <AnyAttribute
                      key={name}
                      name={name}
                      value={value}
                      changelog={anyChangelog(unreservedAttributes[od], name)}
                      expandAll={changelog?.type === 'added'}
                    />
                  );
                })}
              </Box>
            ) : null}
            <Issues ruleResults={props.responseBody[or]} />
          </>
        ) : null}
      </Box>
      {expand
        ? Object.keys(allContents)
            .sort()
            .map((contentType) => (
              <ContentType
                key={contentType}
                schema={allContents[contentType]}
                contentType={contentType}
                changelog={anyChangelog(allContents?.[od], contentType)}
                expandAll={props.expandAll || props.changelog?.type === 'added'}
              />
            ))
        : null}
    </ChangelogBox>
  );
}

function DocGrid(props: {
  leftChildren: React.ReactElement;
  rightChildren?: React.ReactElement;
}) {
  return (
    <Grid container columns={{ xs: 1, sm: 1, md: 2 }} columnSpacing={5}>
      <Grid xs={1} sx={{ flex: 1 }} item>
        {props.leftChildren}
      </Grid>
      <Grid item xs={1}>
        {props.rightChildren}
      </Grid>
    </Grid>
  );
}

function ContentType({
  contentType,
  schema,
  changelog,
  expandAll,
}: {
  contentType: string;
  schema: InternalSpecSchema;
  changelog?: Changelog<InternalSpecSchema>;
  expandAll?: boolean;
}) {
  const [expand, setExpand] = useState(
    expandAll || hasChanges(schema) || changelog?.type === 'added'
  );
  const schemaWithPath = addOpticPath(schema, '');
  return (
    <ChangelogBox changelog={changelog}>
      <DocGrid
        key={`${contentType}-heading`}
        leftChildren={
          <>
            <ChangeIndicator changelog={changelog} />
            <Typography
              variant="h5"
              component="span"
              sx={{
                backgroundColor: 'grey.50',
                padding: 0.2,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                gap: 0.5,
              }}
              onClick={() => setExpand((e) => !e)}
            >
              Content-type: {contentType}{' '}
              {expand ? null : (
                <Box component="span" sx={{ color: 'grey.600' }}>
                  …
                </Box>
              )}
            </Typography>
            <Issues ruleResults={schema[or]} />
          </>
        }
      />
      {expand && (
        <SchemaContextProvider>
          <DocGrid
            key={contentType}
            leftChildren={
              <SchemaDoc schema={schemaWithPath} expandAll={expandAll} />
            }
            rightChildren={
              <SchemaExample value={schemaWithPath} title={contentType} />
            }
          />
        </SchemaContextProvider>
      )}
    </ChangelogBox>
  );
}

function RequestBody({
  requestBody,
  operationId,
  changelog,
  expandAll,
  showAnchors,
}: {
  requestBody: InternalSpecRequestBody;
  operationId: string;
  changelog?: Changelog<InternalSpecRequestBody>;
  expandAll?: boolean;
  showAnchors: boolean;
}) {
  const { description, content, required } = requestBody;
  const diffs = requestBody[od];
  const unreservedAttributes = objectWithRemovedItems(requestBody.misc);
  const allContents = objectWithRemovedItems(content);
  const [expand, setExpand] = useState(
    expandAll || hasChanges(requestBody) || changelog?.type === 'added'
  );

  return (
    <ChangelogBox changelog={changelog}>
      <Box>
        <ChangeIndicator changelog={changelog} />
        <Box
          sx={{
            mb: expand ? 2 : 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
            onClick={() => setExpand((e) => !e)}
          >
            Request Body
            {expand ? null : (
              <Box component="span" sx={{ color: 'grey.600' }}>
                …
              </Box>
            )}
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Required
              value={required}
              changelog={anyChangelog(diffs, 'required')}
            />
          </Box>
        </Box>
        {expand ? (
          <>
            <Description
              variant="body2"
              value={description}
              changelog={anyChangelog(diffs, 'description')}
            />
            {Object.keys(unreservedAttributes).length > 0 ? (
              <Box sx={{ marginTop: 1 }}>
                {Object.entries(unreservedAttributes).map(([name, value]) => (
                  <AnyAttribute
                    key={name}
                    name={name}
                    value={value}
                    changelog={anyChangelog(unreservedAttributes[od], name)}
                    expandAll={changelog?.type === 'added'}
                  />
                ))}
              </Box>
            ) : null}
            <Issues ruleResults={requestBody[or]} />
          </>
        ) : null}
      </Box>
      {expand
        ? Object.keys(allContents)
            .sort()
            .map((contentType) => (
              <ContentType
                key={contentType}
                contentType={contentType}
                schema={allContents[contentType]}
                changelog={anyChangelog(allContents?.[od], contentType)}
                expandAll={expandAll || changelog?.type === 'added'}
              />
            ))
        : null}
    </ChangelogBox>
  );
}

const inOrder = ['path', 'header', 'cookie', 'query'];

function sortParameters(p1: { in: string }, p2: { in: string }) {
  const rank1 = inOrder.indexOf(p1.in);
  const rank2 = inOrder.indexOf(p2.in);
  return rank2 < rank1 ? 1 : rank2 > rank1 ? -1 : 0;
}
