import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';
import {Typography} from '@material-ui/core';

export default function ReportBug({classes}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Fab variant="extended" className={classes.fab} size="small" onClick={handleClick}>
        Report Bug
      </Fab>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        anchorOrigin={{vertical: 'top', horizontal: 'left'}}

        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <div style={{width: 300, outline: 'none', paddingLeft: 7, paddingRight: 7}}>
          <Typography variant="subtitle1" style={{marginLeft: 3}}>
            Open an Issue
          </Typography>
          <div style={{opacity: .5, padding: 8}}>
            <img src="/jira.png" height={30} />
            <img src="/gitlab.png" height={30} style={{marginLeft: 14}} />
            <img src="/asana.png"  height={30} style={{marginLeft: 14}} />
          </div>
          <Typography variant="caption" color="secondary" style={{marginLeft: 8}}>
            *Available in Optic's Team Edition
          </Typography>
        </div>
      </Menu>
      </>
  );
}
