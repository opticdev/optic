import { createMuiTheme } from '@material-ui/core/styles';

export const primary = '#31366f'
export const secondary = '#ea4a61'

export const appTheme = createMuiTheme({
	palette: {
		primary:  {  main: primary },
		secondary: { main: secondary }
	},
	typography: {
		// Use the system font instead of the default Roboto font.
		fontFamily: ['Ubuntu']
	}
});
