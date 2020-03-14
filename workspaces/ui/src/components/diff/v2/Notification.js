import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import {RemovedRed, UpdatedBlue, AddedGreen} from '../../../contexts/ColorContext';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import IconButton from '@material-ui/core/IconButton';
import {LightTooltip} from '../../tooltips/LightTooltip';
import Tooltip from '@material-ui/core/Tooltip';
import {Typography} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {withDiffContext} from './DiffContext';

const styles = theme => ({
  root: {},
  rotate: {
    transform: 'rotate(180deg)'
  },
  region: {
    display: 'flex',
    flexDirection: 'row',
    // borderRight: '1px solid #dcdcdc',
    paddingRight: 8,
    height: 28
  }
});

function _DiffNotification(props) {

  const {classes, description, onClick} = props;

  const addition = <DoubleArrowIcon style={{width: '.8em', height: '.8em', color: AddedGreen}}
                                    className={classes.rotate}/>;

  const update = <ChangeHistoryIcon style={{width: '.7em', height: '.8em', color: UpdatedBlue}}/>;

  const removal = <DoubleArrowIcon style={{width: '.8em', height: '.8em', color: RemovedRed}}/>;

  return (
    <DiffToolTip interactive placement="right" title={
      <Typography variant="subtitle2" style={{padding: 8}}>{description.title}</Typography>
    }>
      <IconButton size="small" onClick={onClick}>
        {description.changeTypeAsString === 'Addition' && addition}
        {description.changeTypeAsString === 'Update' && update}
        {description.changeTypeAsString === 'Removal' && removal}
      </IconButton>
    </DiffToolTip>
  );

}

export const DiffNotification = withStyles(styles)(_DiffNotification);

export const DiffRegion = withDiffContext(withStyles(styles)((props) => {

  const {
    classes,
    children,
    filter,
    regions,
    getDiffDescription,
    getInteractionsForDiff,
    setSelectedDiff
  } = props;
  const diffs = filter(regions);
  // const allDiffs = regions.all
  return (
    <div className={classes.region}>
      {diffs.map(diff => {
        const interactions = getInteractionsForDiff(diff)
        const description = getDiffDescription(diff, interactions[0])

        return <DiffNotification description={description}
                                 diff={diff}
                                 onClick={() => setSelectedDiff(diff)}  />
      })}
      {children}
    </div>
  );

}));


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
