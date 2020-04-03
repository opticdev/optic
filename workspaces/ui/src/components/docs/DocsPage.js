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
import ListItem from '@material-ui/core/ListItem';
import {Card, ListItemText} from '@material-ui/core';
import {EndpointsContextStore, EndpointsContext} from '../../contexts/EndpointContext';
import {PathAndMethod} from '../diff/v2/PathAndMethod';

const useStyles = makeStyles(theme => ({

}));

export const DocsPage = ({match, specService}) => {

  const routerPaths = useRouterPaths();
  return (
    <Page title="Optic Live Contract Testing Dashboard">
      <Page.Navbar
        mini={true}
        baseUrl={match.url}
      />
      <Page.Body>

        <Switch>
          <Route exact path={routerPaths.documentationPage()}
                 component={DocumentationToc}/>
          <Route path={routerPaths.expandedDocsPage()}
                 component={EndpointDocumentationWrapper}/>

        </Switch>

      </Page.Body>
    </Page>
  );
};


export const DocumentationToc = () => {

  const {specService} = useContext(SpecServiceContext)
  const {cachedQueryResults} = useContext(RfcContext)
  const {endpoints} = cachedQueryResults

  return (
    <div>

      <List>

        {endpoints.map(i => {

          return (
            <EndpointsContextStore method={i.method} pathId={i.pathId}>
              <EndpointsContext.Consumer>
              {({endpointDescriptor}) => {
                return (
                  <Card elevation={2}>
                  <ListItem button component={Link} elevation={2} to={`paths/${i.pathId}/methods/${i.method}`}>
                    <ListItemText primary={endpointDescriptor.endpointPurpose} secondary={<PathAndMethod path={endpointDescriptor.fullPath} method={endpointDescriptor.method} />} />
                  </ListItem>
                  </Card>
                )
              }}
              </EndpointsContext.Consumer>
            </EndpointsContextStore>
          )
        })}

      </List>
    </div>
  )

}

export const EndpointDocumentationWrapper = (props) => {

  const {match} = props
  const {pathId, method} = useParams()

  debugger

  return (
    <EndpointsContextStore method={method} pathId={pathId}>
      <EndpointsContext.Consumer>
        {({endpointDescriptor}) => {
          return (
            <Page title="Optic Live Contract Testing Dashboard">
            <Page.Navbar
              mini={true}
              baseUrl={match.url}
            />
            <Page.Body>

              <EndpointDocs/>

            </Page.Body>
          </Page>)
        }}
          </EndpointsContext.Consumer>
    </EndpointsContextStore>
  )
}

export const EndpointDocs = (props) => {

  const classes = useStyles()

  return (
    <EndpointsContext.Consumer>
      {({endpointDescriptor}) => {


        return <div>{endpointDescriptor.endpointPurpose}</div>

      }}
    </EndpointsContext.Consumer>
  )
}
