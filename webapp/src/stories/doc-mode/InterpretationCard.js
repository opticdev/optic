import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '@material-ui/core/Card';
import classNames from 'classnames';
import {Grid, Typography} from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import {DocDarkGrey, DocGrey, methodColors} from './DocConstants';
import {DocCodeBox} from './DocCodeBox';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import {primary, secondary} from '../../theme';
import {DocSubGroup} from './DocSubGroup';
import {DocButton, DocButtonGroup} from './ButtonGroup';
import Divider from '@material-ui/core/Divider';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import DoneIcon from '@material-ui/icons/Done';
import DiffInfo from './DiffInfo';

const styles = theme => ({
  root: {},
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  margin: {
    margin: theme.spacing(1),
  },
  endpointData: {
    display: 'flex',
    flexDirection: 'column',
    alightItems: 'flex-end',
  },
  interpretations: {
    display: 'flex',
  },
  controlsWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

class InterpretationCard extends React.Component {

  render() {
    const {classes} = this.props;

    const method = 'GET';
    const url = '/users/:userId/profile/:attr';
    return (
      <Drawer anchor="bottom" open={true} variant="permanent">
        <Grid container>

          <Grid item sm={4} className={classes.controlsWrapper}>
            <div className={classes.controls}>

              <IconButton aria-label="delete" className={classes.margin} color="primary">
                <ReplayIcon fontSize="large"/>
              </IconButton>

              <div className={classes.endpointData}>
                <Typography variant="h6" component="span"
                            style={{
                              color: DocDarkGrey,
                              textAlign: 'center'
                            }}>Add Pet to User</Typography>
                <Typography variant="caption" style={{textAlign: 'center'}}>Observation 6 of 12</Typography>
              </div>

              <IconButton aria-label="delete" className={classes.margin} color="primary">
                <SkipNextIcon fontSize="large"/>
              </IconButton>

            </div>

          </Grid>

          <Grid item sm={8} className={classes.interpretations}>

            <div style={{flex: 1}} />

            <div style={{flex: 2}}>
              <DiffInfo diffText={'##### Add Field to Request Body\n\n`abc` as type String'}/>
            </div>
            <IconButton className={classes.margin} color="secondary">
              <ErrorOutlineIcon fontSize="large"/>
            </IconButton>

            <IconButton className={classes.margin} color="primary">
              <DoneIcon fontSize="large"/>
            </IconButton>

          </Grid>

        </Grid>
      </Drawer>
    );
  }
}

export default withStyles(styles)(InterpretationCard);
