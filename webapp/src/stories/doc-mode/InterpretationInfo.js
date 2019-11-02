import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  ChangedYellowBackground,
  UpdatedBlue, UpdatedBlueBackground
} from '../../contexts/ColorContext';
import {Typography} from '@material-ui/core';
import {MarkdownRender} from './DocContribution';
import classNames from 'classnames';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';

const styles = theme => ({
  card: {
    borderLeft: `5px solid ${UpdatedBlue}`,
    backgroundColor: UpdatedBlueBackground,
    paddingLeft: 12,
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 14,
    marginRight: 10,
    marginTop: 13,
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 13,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    marginRight: 11
  }
});

function InterpretationInfo({classes}) {

  return (
    <div className={classes.card}>
      <div style={{flex: 1}}>
        <MarkdownRender source={`##### Add Field\n \`fieldA\` will be created `}/>
      </div>
      <div className={classes.buttons}>
        <div>
          <IconButton size="small" disabled>
            <ChevronLeftIcon fontSize="small"/>
          </IconButton>
          <IconButton size="small">
            <ChevronRightIcon fontSize="small"/>
          </IconButton>
          <IconButton size="small" color="primary" autoFocus>
            <DoneIcon fontSize="small"/>
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(InterpretationInfo);
