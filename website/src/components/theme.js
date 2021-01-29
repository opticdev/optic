import { createMuiTheme } from '@material-ui/core/styles';

export const primary = '#31366f';
export const secondary = '#ea4a61';
export const UpdatedBlue = '#2b7bd1';
export const UpdatedBlueBackground = 'rgba(43,123,209,0.11)';
export const AddedGreenBackground = 'rgba(0,196,70,0.3)';
export const ChangedYellowBackground = 'rgba(252,171,16,0.3)';
export const RemovedRedBackground = 'rgba(248,51,60,0.3)';
export const AddedGreen = '#17c8a3';
export const AddedDarkGreen = '#1b6d5c';
export const ChangedYellow = '#c8b768';
export const RemovedRed = '#c86363';
export const SubtleBlueBackground = '#F5F6FA';

export default createMuiTheme({
  palette: {
    primary: { main: primary },
    secondary: { main: secondary },
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: ['Inter', 'Ubuntu Mono'],
    fontWeightMedium: 600,
  },
  overrides: {
    MuiChip: {
      root: {
        marginLeft: "1em"
      }
    }
  }
});
