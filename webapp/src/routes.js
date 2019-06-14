import React from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';
import MasterView from './components/navigation/MasterView';
import {InitialRfcCommandsStore} from './contexts/InitialRfcCommandsContext.js';
import {RfcStore, withRfcContext} from './contexts/RfcContext.js';

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
		fetch('/example-commands/mattermost-commands.json')
			.then(response => {
				if (response.ok) {
					return response.text()
						.then(jsonString => {
							console.log(jsonString)
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
					<X/>
				</RfcStore>
			</InitialRfcCommandsStore>
		);
	}
}

class APIEditorRoutes extends React.Component {
	render() {

		const {url, path, params} = this.props.match;
		const isNew = path === paths.newRoot();


		//@todo get examples showing
		return (
			<div>
				<MasterView content={
					<Switch>
						<Route exact path={paths.newRoot(url)} component={() => <>NEW</>}/>
						<Route path={paths.requestPage(url)}
							   component={({match}) => <>Request Page for {match.params.requestId}</>}/>
						<Route path={paths.conceptPage(url)}
							   component={({match}) => <>Concept Page for {match.params.conceptId}</>}/>
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
