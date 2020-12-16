import React from 'react';
import theme from '../../decorators/theme';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { DocDarkGrey } from '../../../components/docs/DocConstants';
import { primary, RemovedRed } from '../../../theme';
import { coverageDot } from './dummy-data';

export default {
  title: 'Coverage/Summary',
  decorators: [theme],
};

const squareDiameter = 5;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  inner: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: 40,
    alignItems: 'center',
    flexDirection: 'row',
  },
  square: {
    width: squareDiameter,
    height: squareDiameter,
    margin: '0 2px 2px',
    opacity: 1,
    border: `1px solid ${DocDarkGrey}`,
  },
  diff: {
    border: `0px`,
    backgroundColor: RemovedRed,
  },
  covered: {
    border: `0px`,
    backgroundColor: primary,
  },
  divide: {
    width: 1,
    border: `1px solid #e2e2e2`,
    marginLeft: 2,
    minHeight: squareDiameter * 2,
    marginRight: 2,
  },
}));

const exampleInput = {
  requests: [coverageDot({ hasCoverage: true })],
  responses: [
    coverageDot({}),
    coverageDot({ hasDiff: true }),
    coverageDot({ hasCoverage: true }),
    coverageDot({}),
    coverageDot({ hasDiff: true }),
    coverageDot({ hasCoverage: true }),
    coverageDot({}),
    coverageDot({ hasDiff: true }),
    coverageDot({ hasCoverage: true }),
  ],
};

export function CoverageDots({ requests, responses }) {
  const classes = useStyles();

  const Square = ({ hasDiff, hasCoverage }) => {
    if (hasDiff) {
      return <div className={classNames(classes.square, classes.diff)} />;
    }
    if (hasCoverage) {
      return <div className={classNames(classes.square, classes.covered)} />;
    }

    return <div className={classNames(classes.square)} />;
  };

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        {requests.map((i, index) => (
          <Square {...i} key={'req' + index} />
        ))}
      </div>
      {requests.length > 0 && <div className={classes.divide} />}
      <div className={classes.inner}>
        {responses.map((i, index) => (
          <Square {...i} key={'req' + index} />
        ))}
      </div>
    </div>
  );
}
