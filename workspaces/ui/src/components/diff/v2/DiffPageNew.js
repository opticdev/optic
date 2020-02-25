import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {AppBar, Button, Typography} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import {LightTooltip} from '../../tooltips/LightTooltip';
import IconButton from '@material-ui/core/IconButton';
import TimelineIcon from '@material-ui/icons/Timeline';
import Badge from '@material-ui/core/Badge';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';
import {HighlightedIDsStore} from '../../shapes/HighlightedIDs';
import {EndpointPageWithQuery} from '../../requests/EndpointPage';
import {ArrowDownwardSharp} from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {DocGrid} from '../../requests/DocGrid';
import {EndpointsContext, EndpointsContextStore} from '../../../contexts/EndpointContext';

const styles = theme => ({
  root: {
    maxWidth: '90%',
    paddingTop: 15,
    margin: '0 auto',
    paddingBottom: 120
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh'
  },
  scroll: {
    overflow: 'scroll',
    paddingBottom: 300,
    paddingTop: 20,
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white'
  },
});

class DiffPageNew extends React.Component {
  render() {

    const {pathId, method}  = this.props.match.params;
    const {classes}  = this.props;

    return (
      <EndpointsContextStore pathId={pathId} method={method}>
        <EndpointsContext.Consumer>
          {({endpointDescriptor}) => {
            const {fullPath, httpMethod, endpointPurpose, pathParameters} = endpointDescriptor;
            return (
              <div className={classes.container}>

                <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
                  <Toolbar variant="dense">
                    <div style={{flex: 1, textAlign: 'center'}}>
                      <Typography variant="h6" color="primary">{'ABC'}</Typography>
                    </div>
                    <div>
                      <Typography variant="caption" style={{marginRight: 9}}>(0) Changes</Typography>
                      <Button color="primary">Apply Changes</Button>
                    </div>
                  </Toolbar>
                </AppBar>

                <div className={classes.scroll}>
                  <div className={classes.root}>
                    <DocGrid
                      left={(
                        <Toolbar>
                          <Typography variant="subtitle1">21 Diffs observed in 19 examples</Typography>
                          <BatchActionsMenu />
                        </Toolbar>
                      )} right={(
                      <Toolbar>
                        <Typography variant="subtitle1">21 Diffs observed in 19 examples</Typography>
                        <BatchActionsMenu />
                      </Toolbar>
                    )} />
                  </div>
                </div>
              </div>
            )
          }}
        </EndpointsContext.Consumer>
      </EndpointsContextStore>
    )
  }
}

function BatchActionsMenu(props) {

  const [anchorEl, setAnchorEl] = useState(null)
  return (
    <>
      <Button
        color="secondary"
        size="small"
        onClick={(e) => setAnchorEl(e.target)}
        style={{marginLeft: 12}}
        endIcon={<ArrowDownwardSharp/>}>
        Batch Actions</Button>
      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} anchorOrigin={{vertical: 'bottom'}} onClose={() => setAnchorEl(null)}>
        <MenuItem>Accept all Suggestions</MenuItem>
        <MenuItem>Ignore all Diffs</MenuItem>
        <MenuItem>Reset</MenuItem>
      </Menu>
    </>
  );

}

export default withStyles(styles)(DiffPageNew);
