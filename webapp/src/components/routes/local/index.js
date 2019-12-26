import React from 'react';

import {specService} from '../../../services/SpecService.js';
import {routerPaths, basePaths} from '../../../RouterPaths';
import {LoaderFactory} from '../../loaders/LoaderFactory';
import {notificationAreaComponent, shareButtonComponent} from '../../loaders/SharedLoader';

export const basePath = basePaths.localBasePath;
export const basePathIntegrations = basePaths.localIntegrationsPath;

const specServiceTask = async (props) => Promise.resolve(specService)

const {
  Routes: LocalLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  notificationAreaComponent,
  shareButtonComponent,
  basePath
});

export default LocalLoaderRoutes;

//
//
// export class LocalLoader extends React.Component {
//
//   state = {
//     loadedEvents: null,
//     error: null,
//     clientId: 'anonymous',
//     clientSessionId: uuidv4()
//   };
//
//   componentDidMount() {
//     this.loadCommandContext()
//       .then(() => this.loadEvents());
//   }
//
//   loadEvents = () => {
//     return specService.listEvents()
//       .then(events => {
//         this.setState({
//           loadedEvents: events
//         });
//       })
//       .catch((e) => {
//         console.error(e);
//         this.setState({error: true});
//       });
//   };
//
//   loadCommandContext = () => {
//     return specService.getCommandContext()
//       .then(body => {
//         this.setState({
//           clientId: body.userId || 'anonymous'
//         });
//       })
//       .catch((e) => {
//         // no need to indicate error to user
//         console.error(e);
//       });
//   };
//
//   render() {
//     const {loadedEvents, error, clientId, clientSessionId} = this.state;
//
//     if (error) {
//       return (
//         <Dialog open={true}>
//           <DialogTitle>Error Loading Saved Spec</DialogTitle>
//           <DialogContent>Please reload and, if that does not work, open an issue.</DialogContent>
//           <DialogActions>
//             <Button onClick={() => window.location.reload()}>Reload</Button>
//             <Button href="https://github.com/opticdev/optic/issues/new/choose" color="secondary">Open
//               an issue</Button>
//           </DialogActions>
//         </Dialog>
//       );
//     }
//
//     if (loadedEvents === null) {
//       return <Loading/>;
//     }
//
//     function SessionWrapper(props) {
//       const {match} = props;
//       const {sessionId} = match.params;
//       return (
//         <TrafficSessionStore sessionId={sessionId} specService={specService}>
//           <Switch>
//             <Route exact path={routerPaths.diffUrls(diffBasePath)} component={UrlsX}/>
//             <Route exact path={routerPaths.diffRequest(diffBasePath)} component={RequestDiffX}/>
//           </Switch>
//         </TrafficSessionStore>
//       );
//     }
//
//     const diffBasePath = routerPaths.diff(basePath);
//     return (
//       <CommandContextStore clientSessionId={clientSessionId} clientId={clientId}>
//         <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
//           <LocalRfcStore specService={specService}>
//             <Switch>
//               <Route path={routerPaths.request(basePath)} component={RequestsDetailsPage}/>
//               <Route exact path={basePath} component={LocalSpecOverview}/>
//               <Route path={diffBasePath} component={SessionWrapper}/>
//               <Route path={basePathIntegrations} component={({match}) => <IntegrationsLoader match={match} name={match.params.integrationName}/>}/>
//             </Switch>
//           </LocalRfcStore>
//         </InitialRfcCommandsStore>
//       </CommandContextStore>
//     );
//   }
// }
//
// export class LocalSpecOverview extends React.Component {
//
//   state = {
//     isEmpty: false,
//     sessionId: null,
//     samples: []
//   };
//
//   componentDidMount() {
//     Promise.all([
//       specService.listSessions()
//         .then(({sessions}) => sessions.length === 0),
//       specService.listEvents()
//         .then(events => {
//           const numberOfEvents = JSON.parse(events).length;
//           return numberOfEvents <= 2;
//         })
//     ])
//       .then(result => {
//         this.setState({
//           isEmpty: result.every(i => i)
//         });
//       })
//       .catch((e) => {
//         console.error(e);
//       });
//   }
//
//   handleSampleAdded = async (sample) => {
//     if (this.state.samples.length === 0) {
//       const samples = [sample];
//       const sessionId = new Date().toISOString().replace(/:/g, '_');
//       await specService.saveSession(sessionId, {samples});
//       this.setState({sessionId, samples});
//     } else {
//       const {sessionId, samples} = this.state;
//       await specService.saveSession(sessionId, {samples});
//
//       this.setState({
//         samples: [...this.state.samples, sample]
//       });
//     }
//   };
//
//   render() {
//     const key = `${this.state.sessionId}-${this.state.samples.length}`;
//     return (
//       <SpecOverview
//         key={key}
//         specService={specService}
//         addExampleComponent={<DialogWrapper specService={specService} onSampleAdded={this.handleSampleAdded}/>}
//         notificationAreaComponent={<NewBehavior specService={specService} isEmpty={this.state.isEmpty}/>}
//       />
//     );
//   }
// }
//
// export function SpecOverview(props) {
//   const {specService, notificationAreaComponent, shareButtonComponent, addExampleComponent} = props;
//   // return (
//   //   <Overview specService={specService}
//   //             shareButtonComponent={shareButtonComponent}
//   //             notificationAreaComponent={notificationAreaComponent}
//   //             addExampleComponent={addExampleComponent}/>
//   // );
// }
//
// class LocalLoaderRoutes extends React.Component {
//   render() {
//     const {match} = this.props;
//     return (
//       <NavigationStore baseUrl={match.url}>
//         <Switch>
//           <Route path={basePath} component={LocalLoader}/>
//         </Switch>
//       </NavigationStore>
//     );
//   }
// }
//
// export default LocalLoaderRoutes;
