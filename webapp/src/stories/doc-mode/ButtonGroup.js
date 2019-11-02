import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';
import {SubHeadingTitleColor} from './DocConstants';
import {ListItemText} from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import {Link} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';

const styles = theme => ({
  list: {
    maxWidth: 300
  },
  button: {
    paddingLeft: 9,
    borderLeft: '3px solid #e2e2e2',
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
  nakedLink: {
    textDecoration: 'none'
  }
});

class _DocButtonGroup extends React.Component {
  render() {
    const {classes, children, style} = this.props;
    return <List className={classes.list} style={style}>{children}</List>;
  }
}

export const DocButtonGroup = withStyles(styles)(_DocButtonGroup);

class _DocButton extends React.Component {
  render() {
    const {
      classes,
      children,
      color = SubHeadingTitleColor,
      label,
      onClick
    } = this.props;

    return (
      <ListItem
        button
        onClick={this.onClick}
        className={classes.button}
        style={{
          borderLeftColor: color,
          padding: 0,
          paddingLeft: 8
        }}>
        <ListItemText primary={label} primaryTypographyProps={{style: {color}}}/>
      </ListItem>
    );
  }
}

export const DocButton = withStyles(styles)(_DocButton);
