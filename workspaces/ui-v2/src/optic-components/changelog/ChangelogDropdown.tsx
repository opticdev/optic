import React from 'react';
import { makeStyles } from '@material-ui/styles';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import { ToggleButton } from '@material-ui/lab';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
export function ChangesSinceDropdown(props: any) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ToggleButton
        value="check"
        selected={false}
        // onClick={() => {
        //   isEditing ? save() : setEditing(true);
        // }}
        size="small"
        className={classes.button}
        onClick={handleClick}
        style={{ marginRight: 10 }}
      >
        <Typography variant="body2" style={{ textTransform: 'none' }}>
          Compare Versions
        </Typography>
        <CompareArrowsIcon style={{ marginLeft: 3, height: 14 }} />
      </ToggleButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ marginTop: 20 }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    height: 25,
    paddingRight: 5,
  },
  scroll: {
    overflow: 'scroll',
    flex: 1,
  },
}));
