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
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

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
    minHeight: 61,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    marginRight: 11
  }
});

function InterpretationInfo({
                              classes,
                              title,
                              color,
                              description,
                              interpretationsLength,
                              interpretationsIndex,
                              setInterpretationIndex,
                              onAccept
                            }) {


  const hexBGColor = (color === 'green' && AddedGreenBackground) || (color === 'yellow' && ChangedYellowBackground) || UpdatedBlueBackground
  const hexBorderColor = (color === 'green' && AddedGreen) || (color === 'yellow' && ChangedYellow) || UpdatedBlue

  const source = `##### ${title}\n${description}`;

  const leftEnabled = interpretationsIndex > 0;
  const rightEnabled = interpretationsIndex < interpretationsLength - 1;

  return (
    <ScrollIntoViewIfNeeded active smooth>
      <div className={classNames(classes.card, 'pulse')} style={{backgroundColor: hexBGColor, borderLeftColor: hexBorderColor}}>
        <div style={{flex: 1}}>
          <MarkdownRender source={source}/>
        </div>
        <div className={classes.buttons}>
          <div>
            {/*<IconButton size="small" disabled={!leftEnabled}>*/}
            {/*  <ChevronLeftIcon fontSize="small"/>*/}
            {/*</IconButton>*/}
            {/*<IconButton size="small" disabled={!rightEnabled}>*/}
            {/*  <ChevronRightIcon fontSize="small"/>*/}
            {/*</IconButton>*/}
            <IconButton size="small" color="primary" autoFocus onClick={onAccept
            }>
              <DoneIcon fontSize="small"/>
            </IconButton>
          </div>
        </div>
      </div>
    </ScrollIntoViewIfNeeded>
  );
}

export default withStyles(styles)(InterpretationInfo);
