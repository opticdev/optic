// eslint-disable-next-line no-unused-vars
import React from 'react'
import {withStyles} from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';

export const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    maxWidth: 600,
    fontSize: 13,
    padding: 8,
  },
}))(Tooltip);
