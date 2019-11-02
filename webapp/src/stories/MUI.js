import {appTheme} from '../theme';
import React from 'react';
import {ThemeProvider} from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

export const mui = (c, padding = 11) => () => {
	return (
		<React.Fragment>
			<CssBaseline/>
			<ThemeProvider theme={appTheme}>
					<div style={{padding, height: '100vh !important'}}>
						{c}
					</div>
      </ThemeProvider>
		</React.Fragment>
	);
};
