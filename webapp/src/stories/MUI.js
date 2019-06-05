import {appTheme} from '../theme';
import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

export const mui = (c, padding = 11) => () => {
	return (
		<React.Fragment>
			<CssBaseline/>
			<MuiThemeProvider theme={appTheme}>
					<div style={{padding, height: '100vh !important'}}>
						{c}
					</div>
			</MuiThemeProvider>
		</React.Fragment>
	);
};
