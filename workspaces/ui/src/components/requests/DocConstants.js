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
  fontWeight: 600,
  letterSpacing: '.41px',
  textTransform: 'none'
}
export const DocSubGroupHeadingStyles = {
  color : DocGrey,
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '.41px',
}
export const DocSubGroupHeadingBigStyles = {
  color : DocDarkGrey,
  fontSize: '15px',
  fontWeight: 500,
  letterSpacing: '.41px',
}

export const methodColors = {
  'GET': '#52e2a3',
  'POST': '#5aaad1',
  'PUT': '#ee7517',
  'PATCH': '#c8a5dc',
  'DELETE': '#cd8d8c',
};

export const methodColorsDark = {
  'GET': '#276c4e',
  'POST': '#264859',
  'PUT': '#69340a',
  'PATCH': '#796384',
  'DELETE': '#634444',
};

export const primitiveDocColors = {
  $string: '#00f2ff',
  $number: '#e48f91',
  $boolean: '#ff9868',
  $object: '#00ec57',
  $list: '#d3c90a',
  $map: '#7d521f',
  $unknown: '#027a7d',
};

export const DocDivider = ({style}) => <Divider style={{...style, backgroundColor: '#e3e8ee'}} />
export const DocSubHeading = ({title, onClick}) => <Typography onClick={onClick} variant="h5" style={SubHeadingStyles}> {title} </Typography>
