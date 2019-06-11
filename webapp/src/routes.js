import React from 'react'
import {Redirect, Switch, Route} from 'react-router-dom';
import path from 'path'

const paths = {
	newRoot: () => '/new',
	example: () => '/examples/:exampleId',
	apiRoot: (base) => base,
	requestPage: (base) => `${base}/requests/:requestId`,
	conceptPage: (base) => `${base}/concepts/:conceptId`,
}


class APIEditorRoutes extends React.Component {
	render() {

		const {url, path, params} = this.props.match

		const isNew = path === paths.newRoot()

		return (
			<div>
				<Switch>
					<Route exact path={paths.apiRoot(url)} component={() => <>Welcome to the editor for API {(isNew) ? 'new api' : `existing api ${params.exampleId}`} </>}/>
					<Route path={paths.requestPage(url)} component={({match}) => <>Request Page for {match.params.requestId}</>}/>
					<Route path={paths.conceptPage(url)} omponent={({match}) => <>Concept Page for {match.params.conceptId}</>}/>
					<Redirect to={paths.apiRoot(url)}/>
				</Switch>
			</div>
		);
	}
}

class AppRoutes extends React.Component {
	render() {
		return (
			<div>
				<Switch>
					<Route path={paths.newRoot()} component={APIEditorRoutes} />
					<Route path={paths.example()} component={APIEditorRoutes}/>
					<Redirect to={paths.newRoot()}/>
				</Switch>
			</div>
		);
	}
}

export default AppRoutes;
