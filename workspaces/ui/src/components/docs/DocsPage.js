import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRouterPaths } from '../../RouterPaths';
import Page, { usePageTitle } from '../Page';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import { RfcContext } from '../../contexts/RfcContext';
import { DiffPreviewer, getOrUndefined, toOption } from '@useoptic/domain';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Button } from '@material-ui/core';
import {
  EndpointsContext,
  EndpointsContextStore,
} from '../../contexts/EndpointContext';
import { PathAndMethodLarge, SquareChip } from '../diff/v2/PathAndMethod';
import Typography from '@material-ui/core/Typography';
import { DocDivider } from './DocConstants';
import { DocParameter } from './DocParameter';
import { HeadingContribution, MarkdownContribution } from './DocContribution';
import { DESCRIPTION, PURPOSE } from '../../ContributionKeys';
import groupBy from 'lodash.groupby';
import ContentTabs, { RequestTabsContextStore } from './ContentTabs';
import { BreadcumbX } from '../diff/v2/DiffNewRegions';
import { ShapeExpandedStore } from '../diff/v2/shape_viewers/ShapeRenderContext';
import { ShapeOnlyViewer } from '../diff/v2/shape_viewers/ShapeOnlyShapeRows';
import { ShapeBox } from '../diff/v2/DiffReviewExpanded';
import Paper from '@material-ui/core/Paper';
import EmptyState from '../support/EmptyState';
import { AddOpticLink, DocumentingYourApi } from '../support/Links';
import { track } from '../../Analytics'

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: '100%',
    paddingTop: 60,
    maxWidth: 750,
    alignSelf: 'center',
  },
  paper: {
    marginTop: 22,
    marginBottom: 30,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    // backgroundColor: 'red',
    alignItems: 'flex-start',
    paddingTop: 10,
    flex: 1,
    paddingBottom: 5,
  },
  contributions: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 20,
    width: '60%',
  },
  overviewSection: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  expand: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingRight: 10,
    marginTop: 37,
    backgroundColor: 'rgba(241,241,241,0.69)',
  },
  specPreview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const DocsPage = ({ match, specService }) => {
  const routerPaths = useRouterPaths();
  return (
    <Page title="Documentation" scrollToTop={true}>
      <Page.Navbar mini={true} />
      <Page.Body>
        <Switch>
          <Route
            exact
            path={routerPaths.docsRoot}
            component={DocumentationToc}
          />
          <Route
            path={routerPaths.requestDocsRoot}
            component={EndpointDocumentationWrapper}
          />
        </Switch>
      </Page.Body>
    </Page>
  );
};

export const DocumentationToc = () => {
  const classes = useStyles();
  const { cachedQueryResults } = useContext(RfcContext);
  const { endpoints } = cachedQueryResults;

  return (
    <div className={classes.maxWidth}>
      {endpoints.length === 0 && (
        <EmptyState
          title="Document your First Endpoint"
          content={`
1. Follow the [Getting Started Tutorial](${AddOpticLink})
2. Run \`api start\` and send the API some traffic
3. Use [Optic to document your API](${DocumentingYourApi})
`.trim()}
        />
      )}
      {endpoints.length > 0 && (
        <>
          <Typography variant="h5" color="primary">
            Documentation
          </Typography>
          <DocDivider />
        </>
      )}
      <div>
        {endpoints.map((i) => {
          return (
            <EndpointsContextStore method={i.method} pathId={i.pathId}>
              <EndpointsContext.Consumer>
                {({
                  endpointDescriptor,
                  updateContribution,
                  getContribution,
                  endpointId,
                }) => {
                  const hasRequestBody = Boolean(
                    endpointDescriptor.requestBodies.find(
                      (i) => i.requestBody.httpContentType
                    )
                  );

                  return (
                    <div className={classes.paper}>
                      <div>
                        <div className={classes.header}>
                          <HeadingContribution
                            value={getContribution(endpointId, PURPOSE)}
                            label="What does this endpoint do?"
                            onChange={(value) => {
                              updateContribution(endpointId, PURPOSE, value);
                              track("updateContribution", {endpointId, PURPOSE, value})
                            }}
                          />

                          <div style={{ flex: 1 }} />

                          <PathAndMethodLarge
                            path={endpointDescriptor.fullPath}
                            method={endpointDescriptor.method}
                          />
                        </div>

                        <div className={classes.contributions}>
                          <MarkdownContribution
                            value={getContribution(endpointId, DESCRIPTION)}
                            label="Detailed Description"
                            onChange={(value) => {
                              updateContribution(
                                endpointId,
                                DESCRIPTION,
                                value
                              );
                              track("updateContribution", {endpointId, DESCRIPTION, value});
                            }}
                          />
                        </div>

                        <div className={classes.specPreview}>
                          <div style={{ flex: 1 }} />

                          <Paper className={classes.expand} elevation={0}>
                            <Button
                              component={Link}
                              to={`documentation/paths/${endpointDescriptor.pathId}/methods/${endpointDescriptor.method}`}
                              size="medium"
                              color="primary"
                              endIcon={<ExpandMoreIcon />}
                            >
                              Full Documentation
                            </Button>
                            <div style={{ flex: 1 }} />

                            {hasRequestBody && (
                              <Typography
                                variant="overline"
                                color="textSecondary"
                                style={{ marginRight: 15 }}
                              >
                                Has Request Body
                              </Typography>
                            )}

                            <Typography
                              variant="overline"
                              color="textSecondary"
                              style={{ marginRight: 7 }}
                            >
                              Responses:{' '}
                            </Typography>
                            <div
                              style={{
                                marginTop: 3,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {endpointDescriptor.responses.map((res) => {
                                return (
                                  <SquareChip
                                    label={res.statusCode}
                                    bgColor={'#32536a'}
                                    color="white"
                                    style={{ marginRight: 12 }}
                                  />
                                );
                              })}
                            </div>
                          </Paper>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </EndpointsContext.Consumer>
            </EndpointsContextStore>
          );
        })}
      </div>
    </div>
  );
};

export const EndpointDocumentationWrapper = (props) => {
  const { pathId, method } = useParams();

  return (
    <EndpointsContextStore method={method} pathId={pathId}>
      <EndpointsContext.Consumer>
        {({ endpointDescriptor }) => (
          <EndpointDocs endpointDescriptor={endpointDescriptor} />
        )}
      </EndpointsContext.Consumer>
    </EndpointsContextStore>
  );
};

export const EndpointDocs = (props) => {
  const { endpointDescriptor } = props;
  const classes = useStyles();
  const purpose = endpointDescriptor.endpointPurpose;
  const fingerPrint = `${endpointDescriptor.httpMethod} ${endpointDescriptor.fullPath}`;
  usePageTitle(`${purpose || fingerPrint} - API Documentation`);

  const { rfcService, rfcId, cachedQueryResults } = useContext(RfcContext);
  const { shapesResolvers } = cachedQueryResults;
  const currentRfcState = rfcService.currentState(rfcId);
  const diffPreviewer = new DiffPreviewer(shapesResolvers, currentRfcState);
  return (
    <ShapeExpandedStore>
      <div className={classes.maxWidth} style={{ paddingTop: 30 }}>
        <EndpointsContext.Consumer>
          {({ updateContribution, getContribution, endpointId }) => {
            const { requestBodies, responses } = endpointDescriptor;

            const responsesGroupedByStatusCode = groupBy(
              responses,
              (i) => i.statusCode
            );

            const allResponses = Object.keys(responsesGroupedByStatusCode)
              .sort()
              .map((i) => {
                return {
                  statusCode: i,
                  contentTypes: responsesGroupedByStatusCode[i.toString()]
                    .map((res) => res.responseBody.httpContentType || 'No Body')
                    .sort(),
                };
              });

            return (
              <div>
                <HeadingContribution
                  value={getContribution(endpointId, PURPOSE)}
                  label="What does this endpoint do?"
                  onChange={(value) => {
                    updateContribution(endpointId, PURPOSE, value);
                    track("updateContribution", {endpointId, PURPOSE, value})
                  }}
                />
                <MarkdownContribution
                  value={getContribution(endpointId, DESCRIPTION)}
                  label="Detailed Description"
                  onChange={(value) => {
                    updateContribution(endpointId, DESCRIPTION, value);
                    track("updateContribution", {endpointId, DESCRIPTION, value})
                  }}
                />

                <DocDivider style={{ marginTop: 10, marginBottom: 10 }} />

                <div className={classes.overviewSection}>
                  <PathAndMethodLarge
                    path={endpointDescriptor.fullPath}
                    method={endpointDescriptor.method}
                  />

                  <div style={{ marginTop: 7 }}>
                    {endpointDescriptor.pathParameters.map((i) => (
                      <DocParameter
                        title={i.name}
                        paramId={i.pathId}
                        updateContribution={updateContribution}
                        description={i.description}
                      />
                    ))}
                  </div>
                </div>

                <DocDivider style={{ marginTop: 10, marginBottom: 10 }} />

                <RequestTabsContextStore>
                  <ContentTabs
                    inRequest
                    options={{
                      contentTypes: requestBodies
                        .map((i) => i.requestBody.httpContentType)
                        .filter((i) => !!i),
                    }}
                    renderDescription={(contentType) => {
                      const id = `${endpointId}_request_body`;
                      return (
                        <MarkdownContribution
                          value={getContribution(id, DESCRIPTION)}
                          label="Request Body Description"
                          onChange={(value) => {
                            updateContribution(id, DESCRIPTION, value);
                            track("updateContribution", {id, DESCRIPTION, value})
                          }}
                        />
                      );
                    }}
                    renderRequest={(contentType) => {
                      const r = requestBodies.find(
                        (i) => i.requestBody.httpContentType === contentType
                      );
                      const renderedShape =
                        r &&
                        getOrUndefined(
                          diffPreviewer.previewShape(
                            toOption(r.requestBody.shapeId)
                          )
                        );

                      return (
                        renderedShape && (
                          <ShapeBox
                            header={
                              <BreadcumbX
                                itemStyles={{ fontSize: 13, color: 'white' }}
                                location={['Request Body', contentType]}
                              />
                            }
                          >
                            <ShapeOnlyViewer preview={renderedShape} />
                          </ShapeBox>
                        )
                      );
                    }}
                  />

                  <ContentTabs
                    options={allResponses}
                    renderDescription={(statusCode, contentType) => {
                      const id = `${endpointId}_${statusCode}_response`;
                      return (
                        <MarkdownContribution
                          value={getContribution(id, DESCRIPTION)}
                          label={`${statusCode} Response Description`}
                          onChange={(value) => {
                            updateContribution(id, DESCRIPTION, value);
                            track("updateContribution", {id, DESCRIPTION, value})
                          }}
                        />
                      );
                    }}
                    renderResponse={(statusCode, contentType) => {
                      const response = responses.find(
                        (i) =>
                          i.statusCode == statusCode &&
                          i.responseBody.httpContentType === contentType
                      );

                      const renderedShape =
                        response &&
                        getOrUndefined(
                          diffPreviewer.previewShape(
                            toOption(response.responseBody.shapeId)
                          )
                        );

                      return (
                        renderedShape && (
                          <ShapeBox
                            header={
                              <BreadcumbX
                                itemStyles={{ fontSize: 13, color: 'white' }}
                                location={[
                                  `${statusCode} Response Body`,
                                  contentType,
                                ]}
                              />
                            }
                          >
                            <ShapeOnlyViewer preview={renderedShape} />
                          </ShapeBox>
                        )
                      );
                      // return <div>{statusCode} {contentType}</div>;
                    }}
                  />
                </RequestTabsContextStore>

                <div style={{ height: '100vh' }} />
              </div>
            );
          }}
        </EndpointsContext.Consumer>
      </div>
    </ShapeExpandedStore>
  );
};
