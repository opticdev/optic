import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';
import {AddedGreenBackground, ChangedYellowBackground, RemovedRedBackground} from '../../../contexts/ColorContext';
import Toolbar from '@material-ui/core/Toolbar';
import WarningIcon from '@material-ui/icons/Warning';
import {primary, secondary} from '../../../theme';
import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';
import {withShapeRenderContext} from './ShapeRenderContext';
import {
  getOrUndefined,
  mapScala,
  getOrUndefinedJson,
  headOrUndefined,
  CompareEquality,
  lengthScala
} from '@useoptic/domain';
import {withDiffContext} from './DiffContext';
import Paper from '@material-ui/core/Paper';
import Menu from '@material-ui/core/Menu';
import {InterpretationRow} from './DiffViewer';
import {DocSubGroup} from '../../requests/DocSubGroup';
import {IgnoreDiffContext} from './DiffPageNew';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 10,
    paddingBottom: 5
  },
  row: {
    display: 'flex',
    padding: 0,
    paddingLeft: 4,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  rowWithHover: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27) !important',
    },
  },
  menu: {
    userSelect: 'none'
  },
  suggestion: {
    fontStyle: 'italic',
  },
  diffNotif: {
    backgroundColor: '#e3ebf2',
    paddingLeft: 7,
    paddingRight: 7,
    '&:hover': {
      transform: 'scale(1.07)',
      transition: 'transform .2s'
    },
    // border: '1px solid',
  },
  symbols: {
    color: '#595959',
    fontWeight: 800
  },
  value: {
    fontWeight: 600,
  },
  fieldName: {
    fontWeight: 800,
    color: '#20223c',
    fontSize: 12,
  },
  left: {
    flex: 1,
    display: 'flex',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5
  },
  spacerBorder: {
    maxWidth: 1,
    backgroundColor: '#a7a7a7'
  },
  right: {
    display: 'flex',
    paddingLeft: 5,
    paddingTop: 3,
    paddingBottom: 3,
    flex: 1,
  },
  toolbar: {
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dash: {
    fontWeight: 500,
    color: primary
  }
}));


export const DiffViewer = ({shape}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <DepthContext.Provider value={{depth: 0}}>
        {renderShape(shape)}
      </DepthContext.Provider>
    </div>
  );
};

function renderShape(shape) {
  switch (shape.baseShapeId) {
    case '$object':
      return <ObjectRender shape={shape}/>;
      break;
    case '$list':
      return <ListRender shape={shape}/>;
      break;
  }
}

export const DepthContext = React.createContext({depth: 0});

const Indent = ({children}) => {
  return (
    <DepthContext.Consumer>
      {({depth}) => (
        <div style={{paddingLeft: (depth + 1) * 13}}>
          <DepthContext.Provider value={{depth: depth + 1}}>
            {children}
          </DepthContext.Provider>
        </div>
      )}
    </DepthContext.Consumer>
  );
};


export function Row(props) {
  const classes = useStyles();

  const rowHighlightColor = (() => {
    if (props.highlight === 'Addition') {
      return AddedGreenBackground;
    } else if (props.highlight === 'Update') {
      return ChangedYellowBackground;
    } else if (props.highlight === 'Removal') {
      return RemovedRedBackground;
    }
  })();

  return (
    <DepthContext.Provider value={{depth: 0}}>
      <div className={classNames(classes.row, {[classes.rowWithHover]: !props.noHover})}
           style={{backgroundColor: rowHighlightColor}}>
        <div className={classes.left}>{props.left}</div>
        <div className={classes.spacerBorder}>{' '.replace(/ /g, '\u00a0')}</div>
        <div className={classes.right}>{props.right}</div>
      </div>
    </DepthContext.Provider>
  );
}

export const ObjectRender = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {shapeRender, shape} = props;

  const fields = shapeRender.resolveFields(shape.fields);

  console.log('resolved fields ' + fields.toString());

  return (
    <>
      <Row left={<Symbols>{'{'}</Symbols>} right={<TypeName typeName="$object"/>} noHover/>
      {mapScala(fields)(field => <FieldRow field={field}/>)}
      <Row left={<Symbols>{'}'}</Symbols>} noHover/>
    </>
  );
});

export const ListRender = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {shapeRender, shape} = props;

  const listItemShape = getOrUndefined(shapeRender.listItemShape(shape.shapeId))
  const items = shapeRender.resolvedItems(shape.shapeId);

  return (
    <>
      <Row left={<Symbols>{'['}</Symbols>} right={<TypeName typeName="$object"/>} noHover/>
      {mapScala(items)((item, index) => <ItemRow item={item} listItemShape={listItemShape} isLast={index - 1 === lengthScala(items)}/>)}
      <Row left={<Symbols>{']'}</Symbols>} noHover/>
    </>
  );
});

function FieldName({children, missing}) {
  const classes = useStyles();
  return (
    <Typography variant="caption" className={classes.fieldName}
                style={{opacity: missing ? .4 : 1}}>{children}:</Typography>
  );
}

const colors = {
  key: '#0451a5',
  string: '#a31515',
  number: '#09885a',
  boolean: '#0000ff',
};

function Value({value}) {
  const classes = useStyles();

  const typeO = typeof value;

  if (typeO === 'string') {
    return <Typography variant="caption"
                       style={{color: colors[typeO]}}>"{value}"</Typography>;
  }

  if (typeO === 'boolean') {
    return <Typography variant="caption"
                       style={{color: colors[typeO]}}>{value ? 'true' : 'false'}</Typography>;
  }


  return <Typography variant="caption"
                     style={{color: colors[typeO]}}>{value}</Typography>;
}

function TypeName({typeName, style}) {
  const classes = useStyles();

  const typeToColorsMap = {
    '$string': colors.string,
  };

  return (
    <Typography variant="caption"
                style={{color: typeToColorsMap[typeName], fontWeight: 600, ...style}}>{typeName}</Typography>
  );

}

function Symbols({children}) {
  const classes = useStyles();

  return (
    <Typography variant="caption"
                className={classes.symbols}>{children}</Typography>
  );

}


export const DiffNotif = withShapeRenderContext(withDiffContext((props) => {
  const classes = useStyles();
  const {diffDescription, diff, selectedInterpretation, setSelectedInterpretation, setSelectedDiff} = props;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    setSelectedDiff(diff);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const contents = (
    <>
      <WarningIcon style={{color: secondary, height: 10, width: 10}}/>
      <Typography variant="caption" style={{marginLeft: 6}}>{diffDescription.assertion}</Typography>
    </>
  );

  return (
    <>
      <Paper elevation={2} className={classes.diffNotif} onClick={handleClick}>
        {contents}
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{vertical: 'bottom'}}
        elevation={4}
        onClose={handleClose}
      >
        <IgnoreDiffContext.Consumer>
          {({ignoreDiff}) => (
            <div className={classes.menu}>
              {/*<div style={{padding: 4}}>{contents}</div>*/}
              <DocSubGroup title={<Typography style={{marginLeft: 6}} variant="overline" color="primary">Suggestions
              </Typography>} style={{marginTop: 0}}>
                {mapScala(diff.suggestions)((interpretation) => {
                  return (
                    <InterpretationRow
                      action={interpretation.title}
                      onClick={() => {
                        setSelectedDiff(diff);
                        setSelectedInterpretation(interpretation);
                      }}/>);
                })}
                <InterpretationRow
                  action={'Ignore Diff'}
                  onClick={() => {
                    setSelectedInterpretation(null);
                    ignoreDiff(diff.diff);
                  }}/>

              </DocSubGroup>
            </div>
          )}
        </IgnoreDiffContext.Consumer>
      </Menu>
    </>
  );

}));

export const FieldRow = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {field, shapeRender, diffDescription, suggestion} = props;

  const missing = field.display === 'missing';

  const fieldShape = getOrUndefined(shapeRender.resolveFieldShape(field.field)) || {};

  const diff = headOrUndefined(field.field.diffs);

  const diffNotif = diff && (
    <Indent><DiffNotif/></Indent>
  );

  return (
    <Row
      highlight={(() => {
        if (diff && suggestion) {
          return suggestion.changeTypeAsString;
        }

        if (diff) {
          return diffDescription.changeTypeAsString;
        }
      })()}
      left={(
        <Indent>
          <div style={{display: 'flex'}}>
            <div>
              <FieldName missing={missing}>{field.fieldName}</FieldName>
            </div>
            <div style={{flex: 1, paddingLeft: 4}}>
              <Value value={getOrUndefinedJson(field.field.exampleValue)}/>
            </div>
          </div>
        </Indent>
      )}
      right={(() => {

        console.log('yyy', shapeRender);
        console.log('yyy', field);

        if (diffNotif && suggestion) {
          return <Indent>
            {suggestion.changeTypeAsString !== 'Removal' &&
            <TypeName style={{marginRight: 9}} typeName={fieldShape.baseShapeId}/>}
            <Typography variant="caption" className={classes.suggestion}>
              ({suggestion.changeTypeAsString})
            </Typography>
          </Indent>;
        }

        if (diffNotif) {
          return diffNotif;
        }

        if (fieldShape) {
          return <Indent><TypeName typeName={fieldShape.baseShapeId}></TypeName></Indent>;
        }
      })()}
    />
  );
});

export const ItemRow = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {item, shapeRender, isLast, listItemShape, diffDescription, suggestion} = props;
  const diff = headOrUndefined(item.item.diffs);

  const diffNotif = diff && (
    <Indent><DiffNotif/></Indent>
  );

  return (
    <Row
      highlight={(() => {
        if (diff && suggestion) {
          return suggestion.changeTypeAsString;
        }

        if (diff) {
          return diffDescription.changeTypeAsString;
        }
      })()}
      left={(
        <Indent>
          <div style={{display: 'flex'}}>
            <div className={classes.dash}>-</div>
            <div style={{flex: 1, paddingLeft: 4}}>
              <Value value={getOrUndefinedJson(item.item.exampleValue)}/>
            </div>
          </div>
        </Indent>
      )}
      right={(() => {

        if (diffNotif && suggestion) {
          return <Indent>
            {suggestion.changeTypeAsString !== 'Removal' &&
            <TypeName style={{marginRight: 9}} typeName={listItemShape.baseShapeId}/>}
            <Typography variant="caption" className={classes.suggestion}>
              ({suggestion.changeTypeAsString})
            </Typography>
          </Indent>;
        }
        if (diffNotif) {
          return diffNotif;
        }
        if (listItemShape) {
          return <Indent><TypeName typeName={listItemShape.baseShapeId}></TypeName></Indent>;
        }
      })()}
    />
  );
});


export const DiffToolTip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#2A3B72',
    color: 'rgba(247, 248, 240, 1)',
    boxShadow: theme.shadows[1],
    maxWidth: 200,
    fontSize: 11,
    fontWeight: 200,
    padding: 0,
  },
}))(Tooltip);
