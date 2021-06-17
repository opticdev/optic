import { darken, makeStyles, Theme } from '@material-ui/core';

type SpacingInputs = {
  size?: number;
};

export const useSpacingStyles = makeStyles<Theme, SpacingInputs>((theme) => ({
  padding: ({ size = 1 }) => ({
    padding: theme.spacing(size),
  }),
  paddingTop: ({ size = 1 }) => ({
    paddingTop: theme.spacing(size),
  }),
  paddingLeft: ({ size = 1 }) => ({
    paddingLeft: theme.spacing(size),
  }),
  paddingRight: ({ size = 1 }) => ({
    paddingRight: theme.spacing(size),
  }),
  paddingBottom: ({ size = 1 }) => ({
    paddingBottom: theme.spacing(size),
  }),
  margin: ({ size = 1 }) => ({
    margin: theme.spacing(size),
  }),
  marginTop: ({ size = 1 }) => ({
    marginTop: theme.spacing(size),
  }),
  marginLeft: ({ size = 1 }) => ({
    marginLeft: theme.spacing(size),
  }),
  marginRight: ({ size = 1 }) => ({
    marginRight: theme.spacing(size),
  }),
  marginBottom: ({ size = 1 }) => ({
    marginBottom: theme.spacing(size),
  }),
}));

export const useUtilityStyles = makeStyles<Theme, { baseColor?: string }>(
  (theme) => ({
    link: ({ baseColor = '#fff' }) => ({
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: darken(baseColor, 0.1),
      },
    }),
  })
);
