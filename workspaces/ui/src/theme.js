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
export const OpticBlue = '#1B2958';
export const SubtleBlueBackground = '#F5F6FA';

export const methodColors = {
  OPTIONS: '#686868',
  GET: '#52e2a3',
  POST: '#5aaad1',
  PUT: '#ee7517',
  PATCH: '#c8a5dc',
  DELETE: '#cd8d8c',
};

export const methodColorsDark = {
  OPTIONS: '#686868',
  GET: '#276c4e',
  POST: '#264859',
  PUT: '#69340a',
  PATCH: '#796384',
  DELETE: '#634444',
};

export const appTheme = createMuiTheme({
  palette: {
    primary: { main: primary },
    secondary: { main: secondary },
    updated: { main: UpdatedBlue, background: UpdatedBlueBackground },
    added: { main: AddedGreen, background: AddedGreenBackground },
    removed: { main: RemovedRed, background: RemovedRedBackground },
    info: {
      background: SubtleBlueBackground,
      main: SubtleBlueBackground
    },

    httpMethods: {
      OPTIONS: { main: methodColors.OPTIONS, dark: methodColorsDark.OPTIONS },
      GET: { main: methodColors.GET, dark: methodColorsDark.GET },
      POST: { main: methodColors.POST, dark: methodColorsDark.POST },
      PUT: { main: methodColors.PUT, dark: methodColorsDark.PUT },
      PATCH: { main: methodColors.PATCH, dark: methodColorsDark.PATCH },
      DELETE: { main: methodColors.DELETE, dark: methodColorsDark.DELETE },
    },
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: ['Ubuntu', 'Inter'],
  },
  overrides: {
    MuiSnackbarContent: {
      root: {
        '&[class*="variantInfo"]': {
          backgroundColor: SubtleBlueBackground,
        },
      }
    },
  }
});
