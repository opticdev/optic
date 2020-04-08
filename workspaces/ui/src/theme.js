import { createMuiTheme } from '@material-ui/core/styles';

export const primary = '#31366f';
export const secondary = '#ea4a61';
export const UpdatedBlue = '#2b7bd1';
export const UpdatedBlueBackground = 'rgba(43,123,209,0.11)';
export const AddedGreenBackground = 'rgba(0,196,70,0.3)';
export const ChangedYellowBackground = 'rgba(252,171,16,0.3)';
export const RemovedRedBackground = 'rgba(248,51,60,0.3)';

export const appTheme = createMuiTheme({
  palette: {
    primary: { main: primary },
    secondary: { main: secondary },
    updated: { main: UpdatedBlue, background: UpdatedBlueBackground }
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: ['Ubuntu', 'Inter']
  }
});
