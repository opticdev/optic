import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../../contexts/EditorContext';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import DoneAll from '@material-ui/icons/DoneAll';


const styles = theme => ({
  description: {
    padding: 12,
    fontSize: 14,
  },
  done: {
    width: 85,
    height: 85,
    color: '#41a84c',
  },
  root: {
    position: 'fixed',
    top: 90,
    width: 380
  }
});

class ConfirmCard extends React.Component {

  render() {
    const {classes, finish} = this.props;
    return (
      <Card className={classes.root} elevation={1}>
        <CardContent style={{padding: 12}}>
          <div style={{textAlign: 'center', flexDirection: 'column'}}>
            <DoneAll className={classes.done}/>
            <Typography variant="overline" component="div" style={{cursor: 'pointer'}}>This request is in line with the spec!</Typography>
          </div>
          <CardActions>
            <div style={{textAlign: 'center', width: '100%'}}>
              <Button size="small" color="primary" onClick={finish}>
                Continue
              </Button>
              {/* <Button size="small" color="secondary">
                Revert
              </Button> */}
            </div>
          </CardActions>
        </CardContent>
      </Card>);
  }
}

export default withEditorContext(withStyles(styles)(ConfirmCard));
