import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { primary } from '../../../../theme';
import {
  ShapeExpandedContext,
  ShapeRenderContext,
  withShapeRenderContext,
} from './ShapeRenderContext';
import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';
import { getOrUndefined, mapScala } from '@useoptic/domain';
import { Typography } from '@material-ui/core';
import { Indent } from './Indent';

export const useShapeViewerStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#16203F',
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
}));

export const HiddenItemEllipsis = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const { setShowAllLists } = useContext(ShapeExpandedContext);
  const { expandId } = props;
  return (
    <DiffToolTip placement="right" title="(Hidden) Click to Expand">
      <div
        className={classes.hiddenItem}
        onClick={() => setShowAllLists(expandId, true)}
      >
        {'⋯'}
      </div>
    </DiffToolTip>
  );
});

export const DiffToolTip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#2A3B72',
    color: 'rgba(247, 248, 240, 1)',
    boxShadow: theme.shadows[1],
    maxWidth: 200,
    fontSize: 11,
    fontWeight: 200,
    padding: 4,
  },
}))(Tooltip);

export const useColor = {
  StringColor: '#e29f84',
  NumberColor: '#09885a',
  BooleanColor: '#E3662E',
  ObjectColor: '#30B1C4',
  ListColor: '#c47078',
  modifier: '#d5d4ff',
};

export const SymbolColor = '#cfcfcf';

export const TypeName = ({ typeName, style, onTypeClick }) => {
  const classes = useShapeViewerStyles();
  const { shapeRender } = useContext(ShapeRenderContext);

  if (!typeName) {
    return null;
  }

  const coloredComponents = typeName.asColoredString(shapeRender.specShapes);

  return (
    <div className={classes.typeName}>
      {mapScala(coloredComponents)((i) => {
        if (i.text) {
          const link = getOrUndefined(i.link);
          const isLink = onTypeClick && link;
          return (
            <span
              onClick={isLink && (() => onTypeClick(link))}
              style={{
                color: useColor[i.color] || i.color,
                whiteSpace: 'pre',
                textDecoration: isLink && 'underline',
                cursor: isLink && 'pointer',
              }}
            >
              {i.text}
            </span>
          );
        }
      })}
    </div>
  );
};

export function Symbols({ children, withIndent }) {
  const classes = useShapeViewerStyles();

  const symbol = (
    <Typography variant="caption" className={classes.symbols}>
      {children}
    </Typography>
  );

  if (withIndent) {
    return <Indent add={-1}>{symbol}</Indent>;
  } else {
    return symbol;
  }
}
