import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    whiteSpace: 'pre'
  },
  item: {
    whiteSpace: 'pre'
  }
});

function ShapeDisplayWithoutContext({classes, shapeStructure}) {
  const components = shapeStructure.map(({name, colorKey, shapeLink, primitiveId}) => {
    const styles = nameToStyles(name, colorKey, primitiveId);

    return <div className={classes.item} style={styles}>{name} </div>;
  });

  return (
    <div className={classes.root}>
      {components}
    </div>
  );

}


export default withStyles(styles)(ShapeDisplayWithoutContext);


/* Domain -> Style Mapping */
const primitiveColors = {
  $string: '#29447b',
  $number: '#ff4da5',
  $boolean: '#ff502f',
  $object: '#32417d',
  $list: '#7d1e34',
  $map: '#7d521f',
  $unknown: '#027a7d',
};

export const nonPrimitiveColor = '#49525f';

const nameToStyles = (name, colorKey, primitiveId) => {

  const style = {fontWeight: 400};

  if (colorKey === 'primitive') {
    style.color = primitiveColors[primitiveId] || nonPrimitiveColor;
  } else if (colorKey === 'modifier') {
    style.color = '#454545';
  } else if (colorKey === 'text') {
    style.fontWeight = 100;
    style.color = 'black';
  }
  return style;

};
