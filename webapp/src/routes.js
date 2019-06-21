import React from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';
import Editor from './components/navigation/Editor';
import {FocusedRequestStore} from './contexts/FocusedRequestContext.js';
import {InitialRfcCommandsStore} from './contexts/InitialRfcCommandsContext.js';
import {RfcStore} from './contexts/RfcContext.js';
import PathPage from './components/PathPage.js';
import ConceptsPage from './components/ConceptsPage';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import {Button} from '@material-ui/core';
import Loading from './components/navigation/Loading';
import Welcome from './components/onboarding/Welcome';
import UploadOAS from './components/onboarding/upload-oas';
import {ImportedOASContext, ImportedOASStore} from './contexts/ImportedOASContext';
import OverView from './components/onboarding/Overview';

export const routerPaths = {
    newRoot: () => '/new',
    example: () => '/examples/:exampleId',
    apiRoot: (base) => base,
    pathPage: (base) => `${base}/paths/:pathId`,
    conceptPage: (base) => `${base}/concepts/:conceptId`,
    localRoot: () => '/saved',
};

export const routerUrls = {
    pathPage: (base, pathId) => `${base}/paths/${pathId}`
}

class ExampleLoader extends React.Component {

    state = {
        example: null,
        error: null
    };

    componentDidMount() {
        fetch(`/example-commands/${this.props.match.params.exampleId}-commands.json`)
            .then(response => {
                if (response.ok) {
                    return response.text()
                        .then(rawString => {
                            if (rawString.startsWith('<!DOCTYPE html>')) {
                                this.setState({error: true});
                            } else {
                                this.setState({
                                    example: rawString
                                });
                            }
                        });
                }
            });
    }

    render() {
        const {example, error} = this.state;

        if (error) {
            return (
                <Dialog open={true}>
                    <DialogTitle>Example not found</DialogTitle>
                    <DialogContent>The example API you are trying to load could not be found.</DialogContent>
                    <DialogActions>
                        <Button onClick={() => window.location.reload()}>Reload</Button>
                        <Button onClick={() => window.location.href = '/new'} color="secondary">Start New API</Button>
                    </DialogActions>
                </Dialog>
            );
        }

        if (example === null) {
            return <Loading/>;
        }
        return (
            <InitialRfcCommandsStore initialCommandsString={example} rfcId="testRfcId">
                <RfcStore>
                    <APIEditorRoutes {...this.props} />
                </RfcStore>
            </InitialRfcCommandsStore>
        );
    }
}

class LocalLoader extends React.Component {

    state = {
        loadedEvents: null,
        error: null
    };

    componentDidMount() {
        fetch(`/events.json`)
            .then(response => {
                if (response.ok) {
                    return response.text()
                        .then(rawString => {
                            if (rawString.startsWith('<!DOCTYPE html>')) {
                                this.setState({error: true});
                            } else {
                                this.setState({
                                    loadedEvents: rawString
                                });
                            }
                        });
                }
            });
    }

    render() {
        const {loadedEvents, error} = this.state;

        if (error) {
            return (
                <Dialog open={true}>
                    <DialogTitle>Error Loading Saved Spec</DialogTitle>
                    <DialogContent>Please reload and if that does not work, open an issue.</DialogContent>
                    <DialogActions>
                        <Button onClick={() => window.location.reload()}>Reload</Button>
                        <Button onClick={() => window.location.reload()} color="secondary">Open an issue</Button>
                    </DialogActions>
                </Dialog>
            );
        }

        if (loadedEvents === null) {
            return <Loading/>;
        }
        return (
            <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
                <RfcStore>
                    <APIEditorRoutes {...this.props} />
                </RfcStore>
            </InitialRfcCommandsStore>
        );
    }
}

class NewApiLoader extends React.Component {
    render() {
        return (
            <ImportedOASContext.Consumer>
                {({providedCommands}) => (
                    <InitialRfcCommandsStore initialCommandsString={providedCommands || '[]'} rfcId="testRfcId">
                        <RfcStore>
                            <APIEditorRoutes {...this.props} />
                        </RfcStore>
                    </InitialRfcCommandsStore>
                )}
            </ImportedOASContext.Consumer>
        );
    }
}

function PathRoot({match}) {
    const {pathId} = match.params;
    return (
        <PathPage pathId={pathId}/>
    )
}

class APIEditorRoutes extends React.Component {
    render() {

        const {url, path, params} = this.props.match;

        const basePath = url;

        return (
            <div>
                <FocusedRequestStore>
                    <Editor basePath={basePath} content={
                        <Switch>
                            <Route exact path={routerPaths.newRoot(url)} component={() => <>NEW</>}/>
                            <Route path={routerPaths.pathPage(url)} component={PathRoot}/>
                            <Route path={routerPaths.conceptPage(url)}
                                   component={({match}) =>
                                       <ConceptsPage conceptId={match.params.conceptId}/>
                                   }/>
                            <Route component={() => <OverView/>}/>
                            <Redirect to={routerPaths.apiRoot(url)}/>
                        </Switch>
                    }/>
                </FocusedRequestStore>
            </div>
        );
    }
}

class AppRoutes extends React.Component {
    render() {

        //in local mode
        if (process.env.REACT_APP_CLI_MODE) {
            return (
                <div>
                    <ImportedOASStore>
                        <Switch>
                            <Route path={routerPaths.localRoot()} component={LocalLoader}/>
                            <Redirect to={routerPaths.localRoot()}/>
                        </Switch>
                    </ImportedOASStore>
                </div>
            )
        }

        //running on website
        return (
            <div>
                <ImportedOASStore>
                    <Switch>
                        <Route path={routerPaths.newRoot()} component={NewApiLoader}/>
                        <Route path={'/upload-oas'} exact component={UploadOAS}/>
                        <Route path={routerPaths.example()} component={ExampleLoader}/>
                        <Route path={'/'} exact component={Welcome}/>
                        <Redirect to={routerPaths.newRoot()}/>
                    </Switch>
                </ImportedOASStore>
            </div>
        );

    }
}

export default AppRoutes;
