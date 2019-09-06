import React from 'react';
import ReactDOM from 'react-dom';
import DevtoolsPanel, { HarStore } from './DevtoolsPanel';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import CaptureHar from './CaptureHar';

const component = (
	<React.Fragment>
		<CssBaseline />
		<HarStore>
			<MemoryRouter initialEntries={['/capture']} initialIndex={0}>
				<Switch>
					<Route path="/capture" component={CaptureHar} />
					<Route path="/cleanup" component={DevtoolsPanel} />
				</Switch>
			</MemoryRouter>
		</HarStore>
	</React.Fragment>
);
ReactDOM.render(component, document.getElementById('root'));