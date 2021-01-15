import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import { primary } from '../../../theme';

export const BreadcumbX = (props) => {
  const classes = useStyles();
  const { location, itemStyles } = props;
  return (
    <Breadcrumbs
      className={classes.location}
      separator={<span style={{ fontSize: 13, ...itemStyles }}>{'›'}</span>}
      aria-label="breadcrumb"
    >
      {location
        .filter((i) => !!i)
        .map((n) => (
          <Typography
            key={n}
            style={itemStyles}
            className={classes.crumb}
            color="primary"
          >
            {n}
          </Typography>
        ))}
    </Breadcrumbs>
  );
};

export const ShapeBox = ({ header, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.shapeBox}>
      <div className={classes.headerBox}>{header}</div>
      <div>{children}</div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  location: {
    marginLeft: 12,
  },
  shapeBox: {
    backgroundColor: primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerBox: {
    padding: 6,
    paddingLeft: 0,
  },
  crumb: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
}));
