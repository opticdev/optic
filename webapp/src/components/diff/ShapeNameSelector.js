import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import FormControl from '@material-ui/core/FormControl';
import {Button, ListItemText, Menu, TextField, Typography, withStyles} from '@material-ui/core';
import {primary} from '../../theme';
import TypeMenu from '../shape-editor/TypeMenu/TypeMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {ShapesCommands} from '../../engine';

const styles = theme => ({
  dot: {
    marginTop: 5,
    color: primary,
    fontSize: 18,
    cursor: 'pointer',
    userSelect: 'none'
  },
  modal: {
    padding: 6,
    paddingTop: 2,
    minWidth: 230,
  }
});

class ShapeNameSelector extends React.Component {

  state = {
    anchorEl: false,
    userInput: ''
  };

  open = (e) => this.setState({anchorEl: e.currentTarget});
  close = () => this.setState({anchorEl: false});
  onEnter = (e) => {
    if (this.state.userInput) {
      this.newShape()
    }
  };

  newShape = () => {
    console.log(this.props)
    this.props.addAdditionalCommands([
      ShapesCommands.RenameShape(this.props.shapeId, this.state.userInput)
    ])
  }

  render() {
    const {shapeId, actualShape, classes, userDefinedName} = this.props;

    const isNamed = !!userDefinedName;

    const availableNames = [];
    const query = '';
    const matchingShapes = [];
    if (query === '') {
      // show any matching shapes (by shape) at the top

    } else {
      // show any matching shapes (by query) at the top
    }

    return <>
      <div style={{flex: 1}}/>
      <div className={classes.dot}
           style={{cursor: isNamed ? 'inherit' : 'pointer'}}
           onClick={isNamed ? undefined : this.open}>{isNamed ? '●' : '○'}</div>
      <Menu
        anchorEl={this.state.anchorEl}
        disableAutoFocusItem={true}
        onClose={this.close}
        anchorOrigin={{vertical: 'top', horizontal: 'bottom'}}
        transformOrigin={{vertical: 'top', horizontal: 'center'}}
        open={Boolean(this.state.anchorEl)}>

        <div className={classes.modal}>
          <TextField
            placeholder="Name Concept"
            autoFocus={true}
            fullWidth
            keepMounted
            value={this.state.userInput}
            style={{fontSize: 11}}
            onChange={(e) => this.setState({userInput: e.target.value})}
            onKeyUp={(e) => {
              if (e.keyCode === 13) {
                this.onEnter();
              }
            }}
          />

          <List style={{padding: 0, paddingTop: 9}}>
            {(matchingShapes.length === 0 && this.state.userInput) && (
              <ListItem button onClick={this.newShape}>
                <ListItemText primary={`Create new concept: "${this.state.userInput}"`} primaryTypographyProps={{
                  color: 'secondary',
                  style: {fontSize: 14, padding: 0, marginLeft: -8}
                }}/>
              </ListItem>
            )}
          </List>

        </div>
        {/*<CardActions>*/}
        {/*<Button onClick={this.handleExpectedShapeSet}>Set Shape</Button>*/}
        {/*<Button onClick={this.nameObservedShape}>Set Name</Button>*/}
        {/*</CardActions>*/}
      </Menu>
    </>;

  }
}

export default withNavigationContext(withStyles(styles)(ShapeNameSelector));
