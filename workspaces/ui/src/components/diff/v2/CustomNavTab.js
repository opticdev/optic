import withStyles from '@material-ui/core/styles/withStyles';
import Tab from '@material-ui/core/Tab';
import React from 'react';
import { primary } from '../../../theme';

export const CustomNavTab = withStyles((theme) => {
  return {
    root: {
      textTransform: 'none',
      color: primary,
      padding: 0,
      marginTop: 5,
      height: 35,
      minHeight: 'inherit',
      minWidth: 'inherit',
      fontWeight: 500,
      textAlign: 'left',
      fontSize: theme.typography.pxToRem(13),
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginRight: theme.spacing(2),
      '&:focus': {
        opacity: 1,
      },
    },
    wrapper: {
      alignItems: 'flex-start',
    },
  };
})((props) => <Tab disableRipple {...props} />);

export const CustomNavTabDense = withStyles((theme) => {
  return {
    root: {
      textTransform: 'none',
      color: primary,
      padding: 0,
      marginTop: 5,
      height: 20,
      minHeight: 'inherit',
      minWidth: 'inherit',
      fontWeight: 500,
      textAlign: 'left',
      fontSize: theme.typography.pxToRem(12),
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginRight: theme.spacing(2),
      '&:focus': {
        opacity: 1,
      },
    },
    wrapper: {
      alignItems: 'flex-start',
    },
  };
})((props) => (
  <Tab
    disableRipple
    {...props}
    label={
      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ flex: 1 }}>{props.label}</div>
        <div>{props.count}</div>
      </div>
    }
  />
));
