import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row'
  },
  mainContent: {

  },
  spacer: {
    flex: 1
  },
  right: {
    display: 'flex',
    alignItems: 'center'
  }
});

class ReusableDiffRow extends React.Component {
  render() {
    const {classes, mainContentMax, notifications,  children} = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.mainContent} style={{maxWidth: mainContentMax, width: '100%'}}>{children}</div>
        <div className={classes.spacer}/>
        <div className={classes.right}>{notifications}</div>
      </div>
    );
  }
}

export default withStyles(styles)(ReusableDiffRow);
