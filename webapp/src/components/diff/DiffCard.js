import React, {createRef} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../../contexts/EditorContext';
import Card from '@material-ui/core/Card';
import {CardHeader} from '@material-ui/core';
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

const styles = theme => ({
  header: {
    backgroundColor: '#17c8a3',
    color: 'white',
    padding: 2,
    paddingLeft: 12
  },
  textField: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    fontSize: 12
  },
});
class DiffCard extends React.Component {

  render() {
    const {classes, interpretation, accept} = this.props;
    const {description} = interpretation

    return (
      <Card className={classes.root} style={{marginTop: 40}} elevation={2}>
        <CardHeader title={
          <div style={{display: 'flex'}}>
            <Typography variant="subtitle1" style={{marginTop: 2}}>{description}</Typography>
            <div style={{flex: 1}}/>
          </div>
        } className={classes.header}/>
        <CardContent style={{padding: 0}}>
              <CardActions>
                <Button size="small" color="primary" onClick={accept}>
                  Approve
                </Button>
                <Button size="small" color="secondary">
                  Ignore
                </Button>
              </CardActions>
        </CardContent>
      </Card>);
  }
}

export default withEditorContext(withStyles(styles)(DiffCard));
