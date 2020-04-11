import React, {useContext, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useRouterPaths} from '../../RouterPaths';
import Page from '../Page';
import {Link, Route, Switch, useParams} from 'react-router-dom';
import {CaptureManager} from '../diff/v2/CaptureManagerPage';
import {SpecServiceContext} from '../../contexts/SpecServiceContext';
import {RfcContext} from '../../contexts/RfcContext';
import List from '@material-ui/core/List';
import {DiffPreviewer, getOrUndefined, mapScala, toOption} from '@useoptic/domain';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import {Button, Card, ListItemText} from '@material-ui/core';
import {EndpointsContextStore, EndpointsContext} from '../../contexts/EndpointContext';
import {PathAndMethod, PathAndMethodLarge, SquareChip} from '../diff/v2/PathAndMethod';
import Typography from '@material-ui/core/Typography';
import {DocDarkGrey, DocDivider} from '../requests/DocConstants';
import {UpdatedBlue} from '../../contexts/ColorContext';
import {DocParameter} from '../requests/DocParameter';
import {DocSubGroup} from '../requests/DocSubGroup';
import {HeadingContribution, MarkdownContribution} from '../requests/DocContribution';
import {DESCRIPTION, PURPOSE} from '../../ContributionKeys';
import groupBy from 'lodash.groupby';
import ContentTabs, {RequestTabsContextStore} from '../diff/v2/ContentTabs';
import DiffPreview, {BreadcumbX} from '../diff/v2/DiffPreview';
import {ShapeExpandedStore} from '../diff/v2/shape_viewers/ShapeRenderContext';
import {ShapeOnlyViewer} from '../diff/v2/shape_viewers/ShapeOnlyShapeRows';
import {ShapeBox} from '../diff/v2/DiffReviewExpanded';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  maxWidth: {
    width: '100%',
    paddingTop: 60,
    maxWidth: 980,
    alignSelf: 'center'
  },
  paper: {
    padding: 17,
    marginTop: 22
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    // backgroundColor: 'red',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5
  },
  contributions: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 20,
    width: '60%'
  },
  overviewSection: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  expand: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 37
  },
  specPreview: {
    paddingLeft: 12,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  }
}));

export const DocsPage = ({match, specService}) => {

  const routerPaths = useRouterPaths();
  return (
    <Page title="Documentation">
      <Page.Navbar
        mini={true}
      />
      <Page.Body>

        <Switch>
          <Route exact path={routerPaths.docsRoot}
                 component={DocumentationToc}/>
          <Route path={routerPaths.requestDocsRoot}
                 component={EndpointDocumentationWrapper}/>

        </Switch>

      </Page.Body>
    </Page>
  );
};


export const DocumentationToc = () => {

  const classes = useStyles();
  const {cachedQueryResults} = useContext(RfcContext);
  const {endpoints} = cachedQueryResults;

  return (
    <div className={classes.maxWidth}>
      <Typography variant="h5" color="textSecondary">Documentation</Typography>
      <DocDivider />
      <div>
        {endpoints.map(i => {
          return (
            <EndpointsContextStore method={i.method} pathId={i.pathId}>
              <EndpointsContext.Consumer>
                {({endpointDescriptor, updateContribution, getContribution, endpointId}) => {

                  return (
                    <Paper className={classes.paper}>
                      <div>
                        <div className={classes.header}>
                          <HeadingContribution
                            value={getContribution(endpointId, PURPOSE)}
                            label="What does this endpoint do?"
                            onChange={(value) => {
                              updateContribution(endpointId, PURPOSE, value);
                            }}
                          />

                          <div style={{flex: 1}}/>

                          <PathAndMethodLarge path={endpointDescriptor.fullPath}
                                              method={endpointDescriptor.method}/>

                        </div>


                        <div className={classes.contributions}>
                            <MarkdownContribution
                              value={getContribution(endpointId, DESCRIPTION)}
                              label="Detailed Description"
                              onChange={(value) => {
                                updateContribution(endpointId, DESCRIPTION, value);
                              }}/>
                        </div>

                        <div className={classes.specPreview}>

                          <div style={{flex: 1}}/>

                          <div className={classes.expand}>
                            <Button
                              component={Link}
                              to={`documentation/paths/${endpointDescriptor.pathId}/methods/${endpointDescriptor.method}`}
                              size="medium"
                              color="primary"
                              startIcon={<ExpandMoreIcon/>}>
                              Read Documentation
                            </Button>
                          </div>
                          {/*<div style={{marginTop: 3, display: 'flex', alignItems: 'center'}}>*/}
                          {/*  {endpointDescriptor.responses.map(res => {*/}
                          {/*    return <SquareChip label={res.statusCode} bgColor={'#32536a'} color="white" style={{marginRight: 12}}/>*/}
                          {/*  })}*/}
                          {/*</div>*/}

                        </div>
                      </div>
                    </Paper>
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

  const {pathId, method} = useParams();

  return (
    <EndpointsContextStore method={method} pathId={pathId}>
      <EndpointsContext.Consumer>
        {({endpointDescriptor}) => {
          return (
            <Page title="Optic Live Contract Testing Dashboard">
              <Page.Navbar
                mini={true}
              />
              <Page.Body>

                <EndpointDocs/>

              </Page.Body>
            </Page>);
        }}
      </EndpointsContext.Consumer>
    </EndpointsContextStore>
  );
};

export const EndpointDocs = (props) => {

  const classes = useStyles();

  const {rfcService, rfcId} = useContext(RfcContext);

  const currentRfcState = rfcService.currentState(rfcId);

  return (
    <ShapeExpandedStore>
      <div className={classes.maxWidth} style={{paddingTop: 30}}>
        <EndpointsContext.Consumer>
          {({endpointDescriptor, updateContribution, getContribution, endpointId}) => {

            const {requestBodies, responses} = endpointDescriptor;

            const responsesGroupedByStatusCode = groupBy(responses, (i) => i.statusCode);

            const allResponses = Object.keys(responsesGroupedByStatusCode).map(parseInt).sort().map(i => {
              return {
                statusCode: i, contentTypes: responsesGroupedByStatusCode[i.toString()]
                  .map(res => res.responseBody.httpContentType || 'No Body').sort()
              };
            });

            return (
              <div>
                <HeadingContribution
                  value={getContribution(endpointId, PURPOSE)}
                  label="What does this endpoint do?"
                  onChange={(value) => {
                    updateContribution(endpointId, PURPOSE, value);
                  }}
                />
                <MarkdownContribution
                  value={getContribution(endpointId, DESCRIPTION)}
                  label="Detailed Description"
                  onChange={(value) => {
                    updateContribution(endpointId, DESCRIPTION, value);
                  }}/>


                <DocDivider style={{marginTop: 10, marginBottom: 10}}/>

                <div className={classes.overviewSection}>

                  <PathAndMethodLarge path={endpointDescriptor.fullPath}
                                 method={endpointDescriptor.method}/>


                  <div style={{marginTop: 7}}>
                    {endpointDescriptor.pathParameters.map(i => <DocParameter title={i.name}
                                                                              paramId={i.pathId}
                                                                              updateContribution={updateContribution}
                                                                              description={i.description}/>)}
                  </div>
                </div>

                <DocDivider style={{marginTop: 10, marginBottom: 10}}/>

                <RequestTabsContextStore>

                  <ContentTabs inRequest
                               options={{contentTypes: requestBodies.map(i => i.requestBody.httpContentType).filter(i => !!i)}}
                               renderDescription={(contentType) => {
                                 const id = `${endpointId}_request_body`;
                                 return (
                                   <MarkdownContribution
                                     value={getContribution(id, DESCRIPTION)}
                                     label="Request Body Description"
                                     onChange={(value) => {
                                       updateContribution(id, DESCRIPTION, value);
                                     }}/>

                                 );
                               }}
                               renderRequest={(contentType) => {
                                 const r = requestBodies.find(i => i.requestBody.httpContentType === contentType);
                                 const renderedShape = r && getOrUndefined(DiffPreviewer.previewShape(currentRfcState, toOption(r.requestBody.shapeId)));

                                 return renderedShape && (
                                   <ShapeBox header={<BreadcumbX
                                     itemStyles={{fontSize: 13, color: 'white'}}
                                     location={['Request Body', contentType]}/>}>
                                     <ShapeOnlyViewer preview={renderedShape}/>
                                   </ShapeBox>
                                 );
                               }}>

                  </ContentTabs>

                  <ContentTabs options={allResponses}
                               renderDescription={(statusCode, contentType) => {
                                 const id = `${endpointId}_${statusCode}_response`;
                                 return (
                                   <MarkdownContribution
                                     value={getContribution(id, DESCRIPTION)}
                                     label={`${statusCode} Response Description`}
                                     onChange={(value) => {
                                       updateContribution(id, DESCRIPTION, value);
                                     }}/>

                                 );
                               }}
                               renderResponse={(statusCode, contentType) => {

                                 const response = responses.find(i => i.statusCode === statusCode && i.responseBody.httpContentType === contentType);
                                 const renderedShape = response && getOrUndefined(DiffPreviewer.previewShape(currentRfcState, toOption(response.responseBody.shapeId)));

                                 return renderedShape && (
                                   <ShapeBox header={<BreadcumbX
                                     itemStyles={{fontSize: 13, color: 'white'}}
                                     location={[`${statusCode} Response Body`, contentType]}/>}>
                                     <ShapeOnlyViewer preview={renderedShape}/>
                                   </ShapeBox>
                                 );
                                 // return <div>{statusCode} {contentType}</div>;
                               }}>

                  </ContentTabs>


                </RequestTabsContextStore>

                <div style={{height: '100vh'}}/>

              </div>
            );

          }}
        </EndpointsContext.Consumer>
      </div>
    </ShapeExpandedStore>
  );
};


