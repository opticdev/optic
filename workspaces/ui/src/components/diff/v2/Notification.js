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
const styles = theme => ({
  root: {},
  rotate: {
    transform: 'rotate(180deg)'
  },
  region: {
    display: 'flex',
    flexDirection: 'row'
  }
});

function DiffNotification(props) {

  const {classes, diff} = props;

  const addition = <DoubleArrowIcon style={{width: '.8em', height: '.8em', color: AddedGreen}}
                                    className={classes.rotate}/>;

  const update = <ChangeHistoryIcon style={{width: '.7em', height: '.8em', color: UpdatedBlue}}/>;

  const removal = <DoubleArrowIcon style={{width: '.8em', height: '.8em', color: RemovedRed}}/>;



  return (
    <DiffToolTip interactive position="bottom" title={
        <Typography variant="subtitle2" style={{padding: 8}}>{diff.title}</Typography>
    }>
      <IconButton size="small">
        {diff.changeType === 'Addition' && addition}
        {diff.changeType === 'Update' && update}
        {diff.changeType === 'Removal' && removal}
      </IconButton>
    </DiffToolTip>
  );

}

export default withStyles(styles)(DiffNotification);

export const DiffRegion = withStyles(styles)((props) => {
  const {classes, children} = props;
  return (
    <div className={classes.region}>
      {children}
    </div>
  );

})


export const DiffToolTip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#2A3B72',
    color: 'rgba(247, 248, 240, 1)',
    boxShadow: theme.shadows[1],
    maxWidth: 600,
    fontSize: 13,
    padding: 0,
  },
}))(Tooltip);
