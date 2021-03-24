import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { primary } from '../../theme';

export const useShapeViewerStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#16203F',
    position: 'relative',
  },
  nested: {
    paddingTop: 10,
    marginTop: 17,
    paddingBottom: 10,
    backgroundColor: '#1c274b',
  },
  row: {
    display: 'flex',
    padding: 0,
    paddingLeft: 4,
    flexDirection: 'row',
  },
  rowWithHover: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27) !important',
    },
    '&:hover .descriptionButton': {
      display: 'inherit !important',
    },
  },

  rowCompass: {
    width: '100%', // set at runtime to match $right
    position: 'fixed',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingLeft: 8,

    cursor: 'pointer',
    animation: '$compassHover 3s ease-in-out infinite',
    opacity: 0,

    willChange: 'opacity',
    transition: '0.1s ease-out opacity',

    '&$isAbove': {
      top: theme.spacing(15),
      opacity: 1,
    },
    '&$isBelow': {
      bottom: theme.spacing(4),
      opacity: 1,
    },
  },

  '@keyframes compassHover': {
    '0%': {
      transform: 'translateY(-2px)',
    },
    '50%': {
      transform: 'translateY(2px)',
    },
    '100%': {
      transform: 'translateY(-2px)',
    },
  },

  isAbove: {},
  isBelow: {},

  rowCompassBody: {
    position: 'relative',
    padding: theme.spacing(0.8, 1),
    marginRight: 8,
    flexShrink: 0,
    flexGrow: 1,

    borderRadius: 15,
  },

  rowCompassDirection: {
    position: 'absolute',
    left: '50%',
    marginLeft: -10,
    width: theme.typography.pxToRem(20),
    height: theme.typography.pxToRem(20),
    flexGrow: 0,
    flexShrink: 0,
    fill: '#f8edf4',
    opacity: 0,
  },

  rowCompassDirectionDown: {
    '$isBelow &': {
      bottom: -28,
      opacity: 1,
    },
  },

  rowCompassDirectionUp: {
    '$isAbove &': {
      top: -28,
      opacity: 1,
    },
  },

  fieldDescription: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 15,
    display: 'flex',
  },
  stayHighlighted: {
    backgroundColor: 'rgba(78,165,255,0.27) !important',
  },
  menu: {
    userSelect: 'none',
  },
  suggestion: {
    fontStyle: 'italic',
    color: 'white',
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
  },
  hiddenItem: {
    color: '#070707',
    fontSize: 10,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: '#ababab',
    borderRadius: 12,
  },
  symbols: {
    color: '#cfcfcf',
    fontWeight: 800,
    fontFamily: "'Source Code Pro', monospace",
  },
  value: {
    fontWeight: 600,
    fontFamily: "'Source Code Pro', monospace",
  },
  fieldName: {
    fontWeight: 600,
    color: '#cfcfcf',
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",
  },
  indexMarker: {
    fontWeight: 500,
    color: '#9cdcfe',
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",
  },
  rowContents: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  left: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
    display: 'flex',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
  },
  spacerBorder: {
    maxWidth: 1,
    backgroundColor: '#4B5A8C',
    flexGrow: 0,
    flexShrink: 0,
  },
  right: {
    display: 'flex',
    paddingLeft: 5,
    paddingTop: 3,
    paddingBottom: 3,
    width: '35%',
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
  },
  typeName: {
    display: 'flex',
    whiteSpace: 'pre',
    flex: 1,
    fontWeight: 600,
    fontFamily: "'Source Code Pro', monospace",
  },
  assertionMet: {
    display: 'flex',
    flex: 1,
    fontWeight: 400,
    color: '#646464',
    fontStyle: 'italic',
    fontFamily: "'Source Code Pro', monospace",
  },
  diffAssertion: {
    color: '#f8edf4',
    flex: 1,
    fontSize: 14,
    fontWeight: 800,
    fontFamily: "'Source Code Pro', monospace",
  },
  toolbar: {
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dash: {
    fontWeight: 500,
    marginLeft: -10,
    color: primary,
  },

  isSticky: {},
}));

export const useColor = {
  StringColor: '#e29f84',
  NumberColor: '#09885a',
  BooleanColor: '#E3662E',
  ObjectColor: '#30B1C4',
  ListColor: '#c47078',
  UnknownColor: '#ffc176',
  modifier: '#d5d4ff',
};

export const SymbolColor = '#cfcfcf';
