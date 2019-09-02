import React, {createRef} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../../contexts/EditorContext';
import Card from '@material-ui/core/Card';
import {CardHeader, Tooltip} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import {primary, secondary} from '../../theme';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import keydown, {Keys} from 'react-keydown';
import TextField from '@material-ui/core/TextField';
import Fade from '@material-ui/core/Fade';
import {everyScala, lengthScala, mapScala, ShapesCommands} from '../../engine';
import Divider from '@material-ui/core/Divider';
import ReactJson from 'react-json-view';
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
            <Typography variant="overline" component="div" style={{cursor: 'pointer'}}>Finalize Changes to this
              Endpoint</Typography>
          </div>
          <CardActions>
            <div style={{textAlign: 'center', width: '100%'}}>
              <Button size="small" color="primary" onClick={finish}>
                Confirm
              </Button>
              <Button size="small" color="secondary">
                Revert
              </Button>
            </div>
          </CardActions>
        </CardContent>
      </Card>);
  }
}

export default withEditorContext(withStyles(styles)(ConfirmCard));
