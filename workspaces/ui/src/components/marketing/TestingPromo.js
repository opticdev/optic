import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';

import LiveTestingDiagram from '../../assets/marketing/optic-contract-testing-diagram.svg';

export default function TestingPromo() {
  const classes = useStyles();

  return (
    <Card className={classes.promo}>
      <CardMedia className={classes.promoDiagram} image={LiveTestingDiagram} />

      <h2>Confidence your API is working as designed</h2>

      <p>
        Optic's Live Contract Testing validates your API is working as designed
        in all your environments. Achieve 100% test coverage of the API's
        contract from your live traffic.
      </p>
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  promo: {
    width: '100%',
    padding: theme.spacing(2, 3),

    [theme.breakpoints.up('md')]: {
      width: (theme.breakpoints.values.md / 4) * 3,
    },

    '& h2': {
      ...theme.typography.h2,
      fontSize: theme.typography.h4.fontSize,
      color: theme.palette.primary.main,
      margin: theme.spacing(4, 0, 2),
    },

    '& p': {
      ...theme.typography.subtitle1,
      fontWeight: theme.typography.fontWeightLight,
    },
  },

  promoDiagram: {
    height: 250,
    margin: theme.spacing(-2, -3, 3),
    backgroundSize: 'cover',
    backgroundPosition: 'top center',
  },
}));
