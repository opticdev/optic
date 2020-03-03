import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { EndpointPageWithQuery } from '../requests/EndpointPage';
import Drawer from '@material-ui/core/Drawer';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DiffInfo from '../diff/DiffInfo';
import { withTrafficSessionContext } from '../../contexts/TrafficSessionContext';
import compose from 'lodash.compose';
import {NamerStore} from '../shapes/Namer';
import TextField from '@material-ui/core/TextField';

const drawerWidth = 340;

const styles = theme => ({

  root: {
    display: 'flex',
    overflow: 'hidden',
    height: '100vh'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    overflow: 'scroll',
    height: '100vh',
    width: `calc(100% - ${drawerWidth}px)`,
  },
  inner: {
    paddingTop: 100,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

});

class PreCommit extends React.Component {

  render() {

    const { classes, requestId, taggedIds } = this.props;
    const { onSave, onDiscard } = this.props;


    const numberAdded = new Set([...taggedIds.addedIds]).size;
    const numberChanged = new Set([...taggedIds.changedIds]).size;

    const plurality = (n) => n === 1 ? '' : 's'

    return (
      <div className={classes.right}>

        <NamerStore disable={true}>
        <div className={classes.content}>
            <EndpointPageWithQuery
              requestId={requestId}
              showShapesFirst={true}
            />
        </div>

        <Drawer anchor="right"
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open={true}>

          <div className={classes.inner}>

            <SaveAltIcon color="primary" style={{ fontSize: 80 }} />

            <Typography variant="h4">
              Finalize Changes
            </Typography>

            <div style={{ flex: 1, width: '90%', marginTop: 25 }}>
              {numberAdded > 0 && <DiffInfo title={`${numberAdded} Addition${plurality(numberAdded)}`} color="green" description={""} />}
              {numberChanged > 0 && <DiffInfo title={`${numberChanged} Update${plurality(numberChanged)}`} color="yellow" description={""} />}
            </div>

            <div style={{ marginTop: 25 }}>

              <Button size="large" color="error" onClick={onDiscard}>
                Discard
              </Button>
              <Button size="large" color="secondary" autoFocus onClick={onSave}>
                Apply Changes
              </Button>
            </div>

          </div>


        </Drawer>

        {/*<Dialog*/}
        {/*  open={false}*/}
        {/*>*/}
        {/*  <DialogTitle>{'Use Google\'s location service?'}</DialogTitle>*/}
        {/*  <DialogContent>*/}
        {/*    <DialogContentText>*/}
        {/*      Let Google help apps determine location. This means sending anonymous location data to*/}
        {/*      Google, even when no apps are running.*/}
        {/*    </DialogContentText>*/}
        {/*  </DialogContent>*/}
        {/*  <DialogActions>*/}
        {/*    <Button onClick={this.discard} color="primary">*/}
        {/*      Discard*/}
        {/*    </Button>*/}
        {/*    <Button onClick={this.accept} color="primary" autoFocus>*/}
        {/*      Apply Changes*/}
        {/*    </Button>*/}
        {/*  </DialogActions>*/}
        {/*</Dialog>*/}
        </NamerStore>
      </div>
    );
  }
}

export default compose(withStyles(styles), withTrafficSessionContext)(PreCommit);
