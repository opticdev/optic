import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Collapse} from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import {StyledTab, StyledTabs} from '../DocCodeBox';
import IconButton from '@material-ui/core/IconButton';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {Show} from '../Show';
import {primitiveDocColors} from '../DocConstants';
import {withRfcContext} from '../../../contexts/RfcContext';

const styles = theme => ({
  row: {
    padding: 4,
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'row',
    color: 'rgb(249, 248, 245)',
    fontSize: 13,
    height: 26,
    userSelect: 'none',
    fontFamily: 'monospace',
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27)'
    },
  },
  colon: {
    marginLeft: 5,
    marginRight: 5,
  },
  typeName: {
    whiteSpace: 'pre',
    userSelect: 'none',
    fontWeight: 100
  },
  arrow: {
    fontSize: 15,
    marginLeft: -16,
    marginTop: 2,
    cursor: 'pointer'
  },
  link: {
    textDecoration: 'underline'
  },
  innerParam: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    marginLeft: 10,
    borderTop: '1px solid #e2e2e2',
    borderBottom: '1px solid #e2e2e2'
  },
  fieldName: {
    fontWeight: 800
  }
});

export const Row = withStyles(styles)(({classes, children, fields, depth}) => {
  return (
    <li className={classes.row} style={{paddingLeft: depth * 8}}>{children}</li>
  );
});

export const ExpandableRow = withStyles(styles)(({classes, children, innerChildren, fields, depth}) => {

  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <li className={classes.row} style={{paddingLeft: depth * 8, cursor: 'pointer'}}
          onClick={() => setExpanded(!expanded)}>
        <div onClick={() => setExpanded(!expanded)}> {expanded ? <ArrowDropDownIcon className={classes.arrow}/> :
          <ArrowRightIcon className={classes.arrow}/>} </div>
        {children}
      </li>
      <Show when={expanded}>
        {innerChildren}
      </Show>
    </>
  );
});

export const Field = withStyles(styles)(({classes, typeName, fields, fieldName, baseShapeId, parameters, depth}) => {

  const [expandedParam, setExpandedParam] = useState(null);


  const shared = <>
    {  typeName[0].colorKey !== 'index' ? (<> <span className={classes.fieldName}>{fieldName}</span> <span className={classes.colon}>:</span> </>) : <>-</>}
    <span style={{marginLeft: 4}}> <TypeNameRender typeName={typeName}/> </span>
  </>;

  if (fields.length) {
    const fieldsRendered = fields.map(i => <Field {...i.shape} fieldName={i.fieldName} depth={depth + 2}/>);
    //use expandable row
    return <ExpandableRow depth={depth + 1} innerChildren={fieldsRendered}>
      {shared}
    </ExpandableRow>;
  }

  const setParam = (param) => {
    if (expandedParam === param) {
      setExpandedParam(null);
    } else {
      setExpandedParam(param);
    }
  };

  return (
    <>
      <Row depth={depth + 1}>
        {shared}
      </Row>
      {expandedParam && (
        <div style={{paddingLeft: depth * 8}}>
          <div className={classes.innerParam}>
            HELLO AIDAN
          </div>
        </div>
      )}
    </>
  );
});

export const TypeNameRender = withStyles(styles)(({classes, typeName, onLinkClick, primitiveId}) => {
  if (!typeName) {
    return <>'something went wrong'</>;
  }

  const components = typeName.map(({name, shapeLink, primitiveId}) => {

    const color = primitiveDocColors[primitiveId];

    if (shapeLink) {
      return (<>
        <span
          onClick={() => {
            if (onLinkClick) {
              onLinkClick(shapeLink);
            }
          }}
          className={classes.link}
          style={{color: color || '#00BFFF'}}>{name}</span>
        {' '}
      </>);
    }

    return <span style={{color}}>{name + ' '}</span>;
  });

  return <span className={classes.typeName}>{components}</span>;

});

export const ObjectViewer = withStyles(styles)(({classes, typeName, fields, depth = 0}) => {

  return (<>
      <Row>{<TypeNameRender typeName={typeName}/>}</Row>
      {fields.map(i => <Field {...i.shape} fieldName={i.fieldName} depth={depth + 1}/>)}
    </>
  );
});

function handleBaseShape(shape) {
  const {baseShapeId} = shape;
  if (baseShapeId === '$object') {
    return <ObjectViewer {...shape} />;
  }
}

class _ShapeViewer extends React.Component {
  render() {
    const {shape, depth = 0, parameters} = this.props;
    const {baseShapeId} = shape;

    const root = handleBaseShape(shape);
    return <div style={{backgroundColor: '#4f5568'}}>{root}</div>;
  }
}

const ShapeViewer = withStyles(styles)(_ShapeViewer);
export default ShapeViewer

export const ExampleViewer = withRfcContext(({example, queries}) => {
  const flatShape = queries.flatShapeForExample(example)
  return <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap} />
})
