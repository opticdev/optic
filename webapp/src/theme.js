import { createMuiTheme } from '@material-ui/core/styles';
import lightBlue from '@material-ui/core/colors/lightBlue';
import yellow from '@material-ui/core/colors/yellow';

export const primary = '#31366f'
export const secondary = '#f57f17'

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
