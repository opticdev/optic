import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Typography } from '@material-ui/core';
import { lighten, makeStyles } from '@material-ui/core/styles';
import { DocDarkGrey } from '../../../docs/DocConstants';
import { LearnAPIPageContext } from './LearnAPIPageContext';

export default function LearnAPIMenu() {
  const classes = useStyles();
  const { startLearning } = useContext(LearnAPIPageContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const show = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function CustomMenuItem({ name, type, why, description }) {
    return (
      <MenuItem
        onClick={() => {
          startLearning(type);
          handleClose();
        }}
        component="div"
      >
        <div className={classes.option}>
          <div className={classes.topline}>
            <Typography variant="body1">{name}</Typography>
            <div style={{ flex: 1 }} />
            <Typography variant="body2" className={classes.why}>
              {why}
            </Typography>
          </div>
          <Typography
            variant="caption"
            className={classes.description}
            component="div"
          >
            {description}
          </Typography>
        </div>
      </MenuItem>
    );
  }

  return (
    <div>
      <Button
        color="primary"
        variant="contained"
        onMouseEnter={show}
        onClick={show}
      >
        Learn Endpoints
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        onMouseLeave={handleClose}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <div onMouseLeave={handleClose}>
          <CustomMenuItem
            name="Automatic"
            type="automatic"
            why="faster"
            description="Learn the current behavior of each endpoint. Optic will document the bodies of each request, and the 2xx, 4xx responses. Optionals, nullables and oneOfs will be inferred."
          />
          <CustomMenuItem
            name="Manual"
            type="manual"
            why="most control"
            description="Add these endpoints to your API. Then manually document the request/response bodies."
          />
        </div>
      </Menu>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  option: {
    width: 400,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  topline: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    wordBreak: 'break-all',
    whiteSpace: 'normal',
    color: DocDarkGrey,
  },
  why: {
    color: '#027a7d',
    fontSize: 10,
    paddingRight: 5,
  },
}));
