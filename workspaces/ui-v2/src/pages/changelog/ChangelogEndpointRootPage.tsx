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
  HttpBodyPanel,
} from '<src>/components';
import { useChangelogPages } from '<src>/components/navigation/Routes';
import { SubtleBlueBackground, FontFamily } from '<src>/styles';
import { selectors, useAppSelector } from '<src>/store';
import { getEndpointId } from '<src>/utils';
import { CodeBlock, EndpointTOC, TwoColumn } from '<src>/pages/docs/components';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
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
  const endpointChanges = useAppSelector(
    (state) => state.endpoints.results.data?.changes || {}
  );
  const endpointWithChanges = selectors.filterRemovedEndpointsForChangelogAndMapChanges(
    thisEndpoint ? [thisEndpoint] : [],
    endpointChanges
  );

  const isEndpointRemoved = thisEndpoint && endpointWithChanges.length === 0;
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
                      renderContribution={(contribution) => (
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
              <div className={classes.panel}>
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
          <div
            className={classes.bodyContainer}
            id={requestBody.requestId}
            key={requestBody.requestId}
          >
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Request Body</h6>
              <ReactMarkdown
                className={classes.contents}
                source={requestBody.description}
              />
            </div>
            <div className={classes.bodyDetails}>
              <div>
                <ContributionFetcher
                  rootShapeId={requestBody.rootShapeId}
                  endpointId={endpointId}
                  changesSinceBatchCommit={batchId}
                >
                  {(contributions) => (
                    <ContributionsList
                      renderContribution={(contribution) => (
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
              <div className={classes.panel}>
                <ShapeFetcher
                  rootShapeId={requestBody.rootShapeId}
                  changesSinceBatchCommit={batchId}
                >
                  {(shapes) => (
                    <HttpBodyPanel
                      shapes={shapes}
                      location={requestBody.contentType}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </div>
        ))}
        {thisEndpoint.responseBodies.map((responseBody) => (
          <div
            className={classes.bodyContainer}
            id={responseBody.responseId}
            key={responseBody.responseId}
          >
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>
                {responseBody.statusCode} Response
              </h6>
              <ReactMarkdown
                className={classes.contents}
                source={responseBody.description}
              />
            </div>
            <div className={classes.bodyDetails}>
              <div>
                <ContributionFetcher
                  rootShapeId={responseBody.rootShapeId}
                  endpointId={endpointId}
                  changesSinceBatchCommit={batchId}
                >
                  {(contributions) => (
                    <ContributionsList
                      renderContribution={(contribution) => (
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
              <div className={classes.panel}>
                <ShapeFetcher
                  rootShapeId={responseBody.rootShapeId}
                  changesSinceBatchCommit={batchId}
                >
                  {(shapes) => (
                    <HttpBodyPanel
                      shapes={shapes}
                      location={responseBody.contentType}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </div>
        ))}
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
    height: '100%',
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
    margin: theme.spacing(3, 0),
  },
  bodyDetails: {
    display: 'flex',
    width: '100%',
    height: '100%',
    '& > div': {
      width: '50%',
      padding: theme.spacing(1, 0),
    },
  },
  panel: {
    position: 'sticky',
    top: 50,
    alignSelf: 'flex-start',
  },
}));
