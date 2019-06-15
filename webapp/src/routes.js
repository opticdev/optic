import React from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';
import Editor from './components/navigation/Editor';
import {InitialRfcCommandsStore} from './contexts/InitialRfcCommandsContext.js';
import {RfcStore, withRfcContext} from './contexts/RfcContext.js';
import RequestPage from './components/RequestPage';
import ConceptsPage from './components/ConceptsPage';

const paths = {
	newRoot: () => '/new',
	example: () => '/examples/:exampleId',
	apiRoot: (base) => base,
	requestPage: (base) => `${base}/requests/:requestId`,
	conceptPage: (base) => `${base}/concepts/:conceptId`,
};

class XWithoutContext extends React.Component {
	render() {
		const {queries, rfcId} = this.props;
		const paths = queries.paths(rfcId);
		return (
			<div>{
				paths.sort().map(x => {
					return (
						<div>{x.absolutePath}</div>
					)
				})
			}</div>
		);
	}
}

const X = withRfcContext(XWithoutContext);

class ExampleLoader extends React.Component {

	state = {
		example: null
	};

	componentDidMount() {
		fetch(`/example-commands/${this.props.match.params.exampleId}-commands.json`)
			.then(response => {
				if (response.ok) {
					return response.text()
						.then(jsonString => {
							this.setState({
								example: jsonString
							});
						});
				}
			});
	}

	render() {
		const {example} = this.state;

		if (example === null) {
			return <div>Loading...</div>;
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

class APIEditorRoutes extends React.Component {
	render() {

		const {url, path, params} = this.props.match;
		const isNew = path === paths.newRoot();

		const basePath = url

		//@todo get examples showing
		return (
			<div>
				<Editor basePath={basePath} content={
					<Switch>
						<Route exact path={paths.newRoot(url)} component={() => <>NEW</>}/>
						<Route path={paths.requestPage(url)}
							   component={({match}) =>
								   <RequestPage requestId={match.params.requestId} />}/>
						<Route path={paths.conceptPage(url)}
							   component={({match}) =>
								   <ConceptsPage conceptId={match.params.conceptId} />
							   }/>
						<Route component={() => <>ROOT</>}/>
						<Redirect to={paths.apiRoot(url)}/>
					</Switch>
				}/>
			</div>
		);
	}
}

class AppRoutes extends React.Component {
	render() {
		return (
			<div>
				<Switch>
					<Route path={paths.newRoot()} component={APIEditorRoutes}/>
					<Route path={paths.example()} component={ExampleLoader}/>
					<Redirect to={paths.newRoot()}/>
				</Switch>
			</div>
		);
	}
}

export default AppRoutes;
