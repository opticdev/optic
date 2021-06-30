import React, { FC } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import { LinearProgress, Typography, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import ReactMarkdown from 'react-markdown';

import {
  EndpointName,
  PathParameters,
  IShapeRenderer,
  JsonLike,
  PageLayout,
  FullWidth,
  FieldOrParameter,
  ContributionFetcher,
  ShapeFetcher,
  QueryParametersPanel,
  ContributionsList,
  convertShapeToQueryParameters,
} from '<src>/components';
import { useChangelogPages } from '<src>/components/navigation/Routes';
import { SubtleBlueBackground, FontFamily } from '<src>/styles';
import { useEndpointsChangelog } from '<src>/hooks/useEndpointsChangelog';
import { selectors, useAppSelector } from '<src>/store';
import { getEndpointId } from '<src>/utils';
import { CodeBlock, EndpointTOC, TwoColumn } from '<src>/pages/docs/components';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
  TwoColumnBodyChangelog,
} from './components';

export const ChangelogEndpointRootPage: FC<
  RouteComponentProps<{
    batchId: string;
    pathId: string;
    method: string;
  }>
> = (props) => {
  return (
    <PageLayout AccessoryNavigation={ChangelogPageAccessoryNavigation}>
      <ValidateBatchId batchId={props.match.params.batchId}>
        <ChangelogRootComponent {...props} />
      </ValidateBatchId>
    </PageLayout>
  );
};

const ChangelogRootComponent: FC<
  RouteComponentProps<{
    pathId: string;
    method: string;
    batchId: string;
  }>
> = ({ match }) => {
  const { pathId, method, batchId } = match.params;
  const classes = useStyles();
  const changelogPageLink = useChangelogPages();
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  const thisEndpoint = useAppSelector(
    selectors.getEndpoint({ pathId, method })
  );
  const changelog = useEndpointsChangelog(batchId);
  const endpointWithChanges = selectors.filterRemovedEndpointsForChangelogAndMapChanges(
    thisEndpoint ? [thisEndpoint] : [],
    changelog
  );

  const isEndpointRemoved =
    changelog.length > 0 && thisEndpoint && endpointWithChanges.length === 0;
  const isEndpointRemovedInThisBatch =
    endpointWithChanges.length > 0 &&
    endpointWithChanges[0].changes === 'removed';

  if (endpointsState.loading) {
    return <LinearProgress variant="indeterminate" />;
  }
  if (endpointsState.error) {
    return <>error loading endpoint changelog information</>;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }

  if (isEndpointRemoved) {
    return <Redirect to={changelogPageLink.linkTo(batchId)} />;
  }

  const endpointId = getEndpointId(thisEndpoint);
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );

  return (
    <>
      {isEndpointRemovedInThisBatch && (
        <Alert severity="error" className={classes.removedInfoHeader}>
          This endpoint has been removed
        </Alert>
      )}
      <FullWidth style={{ paddingTop: 30, paddingBottom: 400 }}>
        <Typography className={classes.regularField}>
          {thisEndpoint.purpose || 'Unnamed Endpoint'}
        </Typography>
        <EndpointName
          fontSize={19}
          leftPad={0}
          method={thisEndpoint.method}
          fullPath={thisEndpoint.fullPath}
        />
        <TwoColumn
          style={{ marginTop: 5 }}
          left={
            <ReactMarkdown
              className={classes.contents}
              source={thisEndpoint.description}
            />
          }
          right={
            <CodeBlock
              header={
                <EndpointName
                  fontSize={14}
                  leftPad={0}
                  method={thisEndpoint.method}
                  fullPath={thisEndpoint.fullPath}
                />
              }
            >
              <PathParameters
                parameters={parameterizedPathParts}
                renderField={(param) => {
                  const alwaysAString: IShapeRenderer = {
                    shapeId: param.id + 'shape',
                    jsonType: JsonLike.STRING,
                    value: undefined,
                  };
                  return (
                    <FieldOrParameter
                      key={param.id}
                      name={param.name}
                      shapes={[alwaysAString]}
                      depth={0}
                      value={param.description}
                    />
                  );
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  backgroundColor: SubtleBlueBackground,
                  borderTop: '1px solid #e2e2e2',
                }}
              >
                <EndpointTOC
                  query={thisEndpoint.query}
                  requests={thisEndpoint.requestBodies}
                  responses={thisEndpoint.responseBodies}
                />
              </div>
            </CodeBlock>
          }
        />

        {thisEndpoint.query && (
          <div className={classes.bodyContainer} id="query-parameters">
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Query Parameters</h6>
              {/* TODO QPB - change id from this to query id from spectacle */}
              <ReactMarkdown className={classes.contents} source={'TODO'} />
            </div>
            <div className={classes.bodyDetails}>
              <div>
                <ContributionFetcher
                  rootShapeId={thisEndpoint.query.rootShapeId}
                  endpointId={endpointId}
                  changesSinceBatchCommit={batchId}
                >
                  {(contributions) => (
                    <ContributionsList
                      ContributionComponent={(contribution) => (
                        <FieldOrParameter
                          key={contribution.id}
                          name={contribution.name}
                          shapes={contribution.shapes}
                          depth={contribution.depth}
                          value={contribution.value}
                        />
                      )}
                      contributions={contributions}
                    />
                  )}
                </ContributionFetcher>
              </div>
              <div>
                <ShapeFetcher
                  rootShapeId={thisEndpoint.query.rootShapeId}
                  changesSinceBatchCommit={batchId}
                >
                  {(shapes) => (
                    <QueryParametersPanel
                      parameters={convertShapeToQueryParameters(shapes)}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </div>
        )}

        {thisEndpoint.requestBodies.map((requestBody) => (
          <TwoColumnBodyChangelog
            changesSinceBatchCommitId={batchId}
            rootShapeId={requestBody.rootShapeId}
            bodyId={requestBody.requestId}
            location={'Request Body'}
            contentType={requestBody.contentType}
            description={requestBody.description}
          />
        ))}
        {thisEndpoint.responseBodies.map((i, index) => {
          return (
            <TwoColumnBodyChangelog
              key={i.rootShapeId}
              changesSinceBatchCommitId={batchId}
              rootShapeId={i.rootShapeId}
              bodyId={i.responseId}
              location={`${i.statusCode} Response`}
              contentType={i.contentType}
              description={i.description}
            />
          );
        })}
      </FullWidth>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  regularField: {
    fontSize: '1.25rem',
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  contents: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4f566b',
    paddingRight: 50,
  },
  removedInfoHeader: {
    justifyContent: 'center',
    display: 'fixed',
  },
  bodyContainer: {
    marginTop: theme.spacing(6),
    width: '100%',
  },
  bodyHeaderContainer: {
    marginBottom: theme.spacing(2),
  },
  bodyHeader: {
    fontSize: '1.25rem',
    fontFamily: FontFamily,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    margin: `${theme.spacing(3)}px 0`,
  },
  bodyDetails: {
    display: 'flex',
    width: '100%',
    '& > div': {
      width: '50%',
      padding: `0 ${theme.spacing(1)}px`,
    },
  },
}));
