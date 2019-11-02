import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Collapse} from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import {StyledTab, StyledTabs} from '../DocCodeBox';
import IconButton from '@material-ui/core/IconButton';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const styles = theme => ({
  row: {
    padding: 4,
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'row',
    color: 'rgb(249, 248, 245)',
    fontSize: 11,
    height: 23,
    fontFamily: 'monospace',
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27)'
    },
  },
  arrow: {
    fontSize: 13,
    marginLeft: -13,
    marginTop: 2,
    cursor: 'pointer'
  },
  innerParam: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    marginLeft: 10,
    borderTop: '1px solid #e2e2e2',
    borderBottom: '1px solid #e2e2e2'
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
      <Fade in={expanded} timeout={100}>
        <div>
          {innerChildren}
        </div>
      </Fade>
    </>
  );
});

export const Field = withStyles(styles)(({classes, typeName, fields, fieldName, baseShapeId, parameters, depth}) => {

  const [expandedParam, setExpandedParam] = useState(null);

  if (baseShapeId === 'object') {
    const fieldsRendered = fields.map(i => <Field {...i} depth={depth + 2}/>);
    //use expandable row
    return <ExpandableRow depth={depth + 1} innerChildren={fieldsRendered}>{fieldName}: {<TypeNameRender
      typeName={typeName}/>}</ExpandableRow>;
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
      <Row depth={depth + 1}>{fieldName}: {<TypeNameRender typeName={typeName} onLinkClick={setParam}/>}</Row>
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

export const TypeNameRender = withStyles(styles)(({classes, typeName, onLinkClick}) => {
  return typeName.map(({name, shapeLink}) => {
    if (shapeLink) {
      return <span onClick={() => {
        if (onLinkClick) {
          onLinkClick(shapeLink);
        }
      }} style={{color: '#00BFFF'}}>{name}</span>;
    }

    return <>{name}</>;
  });
});

export const ObjectViewer = withStyles(styles)(({classes, typeName, fields, depth = 0}) => {

  return (<>
      <Row>{<TypeNameRender typeName={typeName}/>}</Row>
      {fields.map(i => <Field {...i} depth={depth + 1}/>)}
    </>
  );
});

function handleBaseShape(shape) {
  const {baseShapeId} = shape;
  if (baseShapeId === 'object') {
    return <ObjectViewer {...shape} />;
  }
}

class ShapeViewer extends React.Component {
  render() {
    const {shape, depth} = this.props;
    const {baseShapeId} = shape;

    const root = handleBaseShape(shape);

    return <div style={{backgroundColor: '#4f5568'}}>{root}</div>;
  }
}


export default withStyles(styles)(ShapeViewer);
