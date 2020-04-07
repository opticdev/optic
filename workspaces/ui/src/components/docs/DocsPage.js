import React, {useContext, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useRouterPaths} from '../../RouterPaths';
import Page from '../Page';
import {Link, Route, Switch, useParams} from 'react-router-dom';
import {CaptureManager} from '../diff/v2/CaptureManagerPage';
import {SpecServiceContext} from '../../contexts/SpecServiceContext';
import {RfcContext} from '../../contexts/RfcContext';
import List from '@material-ui/core/List';
import {mapScala} from '@useoptic/domain';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import {Button, Card, ListItemText} from '@material-ui/core';
import {EndpointsContextStore, EndpointsContext} from '../../contexts/EndpointContext';
import {PathAndMethod, SquareChip} from '../diff/v2/PathAndMethod';
import Typography from '@material-ui/core/Typography';
import {DocDarkGrey, DocDivider} from '../requests/DocConstants';
import {UpdatedBlue} from '../../contexts/ColorContext';
import {DocParameter} from '../requests/DocParameter';
import {DocSubGroup} from '../requests/DocSubGroup';
import {HeadingContribution, MarkdownContribution} from '../requests/DocContribution';
import {DESCRIPTION, PURPOSE} from '../../ContributionKeys';
import groupBy from 'lodash.groupby';
import ContentTabs, {RequestTabsContextStore} from '../diff/v2/ContentTabs';

const useStyles = makeStyles(theme => ({
  maxWidth: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center'
  },
  diffTocCard: {
    display: 'flex',
    flexDirection: 'row',
    paddingRight: 20
  },
  contributions: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 20
  },
  expand: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20
  },
  specPreview: {
    borderLeft: `1px solid #e3e8ee`,
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
          <Route exact path={routerPaths.documentationPage}
                 component={DocumentationToc}/>
          <Route path={routerPaths.expandedDocsPage}
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
      <div style={{paddingTop: 60}}>
        {endpoints.map(i => {
          return (
            <EndpointsContextStore method={i.method} pathId={i.pathId}>
              <EndpointsContext.Consumer>
                {({endpointDescriptor, updateContribution}) => {

                  const {endpointId} = endpointDescriptor;

                  return (
                    <div>
                      <div className={classes.diffTocCard}>

                        <div className={classes.contributions}>
                          <HeadingContribution
                            value={endpointDescriptor.endpointPurpose}
                            label="What does this endpoint do?"
                            onChange={(value) => {
                              updateContribution(endpointId, PURPOSE, value);
                            }}
                          />
                          <MarkdownContribution
                            value={endpointDescriptor.endpointDescription}
                            label="Detailed Description"
                            onChange={(value) => {
                              updateContribution(endpointId, DESCRIPTION, value);
                            }}/>


                        </div>

                        <div className={classes.specPreview}>
                          <PathAndMethod path={endpointDescriptor.fullPath}
                                         method={endpointDescriptor.method}/>

                          <div style={{display: 'flex', flexDirection: 'column', marginTop: 7}}>
                            {endpointDescriptor.pathParameters.map(i => <DocParameter title={i.name}
                                                                                      paramId={i.pathId}
                              // updateContribution={updateContribution}
                                                                                      description={i.description}/>)}

                          </div>


                          <div style={{flex: 1}}/>


                          <div className={classes.expand}>
                            <Button
                              component={Link}
                              to={`documentation/paths/${endpointDescriptor.pathId}/methods/${endpointDescriptor.method}`}
                              size="small"
                              color="primary"
                              startIcon={<ExpandMoreIcon/>}>
                              Expand Documentation
                            </Button>
                          </div>
                          {/*<div style={{marginTop: 3, display: 'flex', alignItems: 'center'}}>*/}
                          {/*  {endpointDescriptor.responses.map(res => {*/}
                          {/*    return <SquareChip label={res.statusCode} bgColor={'#32536a'} color="white" style={{marginRight: 12}}/>*/}
                          {/*  })}*/}
                          {/*</div>*/}

                        </div>
                      </div>
                      <DocDivider style={{marginTop: 20, marginBottom: 20}}/>
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

  return (
    <div className={classes.maxWidth} style={{paddingTop: 30}}>
      <EndpointsContext.Consumer>
        {({endpointDescriptor, updateContribution}) => {

          const {endpointId, requestBodies, responses} = endpointDescriptor;

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
                value={endpointDescriptor.endpointPurpose}
                label="What does this endpoint do?"
                onChange={(value) => {
                  updateContribution(endpointId, PURPOSE, value);
                }}
              />
              <MarkdownContribution
                value={endpointDescriptor.endpointDescription}
                label="Detailed Description"
                onChange={(value) => {
                  updateContribution(endpointId, DESCRIPTION, value);
                }}/>

              <DocDivider style={{marginTop: 10, marginBottom: 10}}/>

              <RequestTabsContextStore>

                <ContentTabs inRequest
                             options={{contentTypes: requestBodies.map(i => i.requestBody.httpContentType).filter(i => !!i)}}
                             renderRequest={(contentType) => {
                               return <div>{contentType}</div>;
                             }}>

                </ContentTabs>

                <ContentTabs options={allResponses} renderResponse={(statusCode, contentType) => {
                  return <div>{statusCode} {contentType}</div>;
                }}>

                </ContentTabs>


              </RequestTabsContextStore>


            </div>
          );

        }}
      </EndpointsContext.Consumer>
    </div>
  );
};
