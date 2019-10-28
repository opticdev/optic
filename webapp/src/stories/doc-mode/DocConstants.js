import Divider from '@material-ui/core/Divider';
import React from 'react';
import {Typography} from '@material-ui/core';
import {primary} from '../../theme';

export const SubHeadingTitleColor = primary
export const DocGrey = '#a3acb9'
export const DocDarkGrey = '#818892'
export const ParametersStyles = {
  fontWeight: 600,
  fontSize: 13
}
export const SubHeadingStyles = {
  color : SubHeadingTitleColor,
  fontSize: '16px',
  fontWeight: 600,
  letterSpacing: '.41px',
}
export const DocSubGroupHeadingStyles = {
  color : DocGrey,
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '.41px',
}

export const DocDivider = ({style}) => <Divider style={{...style, backgroundColor: '#e3e8ee'}} />
export const DocSubHeading = ({title, onClick}) => <Typography onClick={onClick} variant="overline" style={SubHeadingStyles}> {title} </Typography>
