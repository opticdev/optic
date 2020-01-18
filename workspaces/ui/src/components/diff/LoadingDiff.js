import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {Paper, Typography} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  loaderCenter: {
    width: 340,
    height: 120,
    marginTop: 200,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

class LoadingDiff extends React.Component {
  render() {

    const {classes} = this.props

    return <div className={classes.root}>

      <Paper elevation={2} className={classes.loaderCenter}>
        <CircularProgress disableShrink={true} thickness={5} style={{marginRight: 22}} size={25} />
        <Typography variant="h6" color="primary">Calculating API Diff...</Typography>
      </Paper>

    </div>
  }
}

export default withStyles(styles)(LoadingDiff)
