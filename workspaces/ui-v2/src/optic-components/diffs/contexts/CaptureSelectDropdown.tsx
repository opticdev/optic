import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { ToggleButton } from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import { useParams } from 'react-router-dom';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MenuItem from '@material-ui/core/MenuItem';
// @ts-ignore
import TimeAgo from 'javascript-time-ago';
// @ts-ignore
import en from 'javascript-time-ago/locale/en';
import { ICapture } from '@useoptic/spectacle';

import { useCaptures } from '../../hooks/useCapturesHook';
import { OpticBlueReadable } from '../../theme';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export function CaptureSelectDropdown(props: any) {
  const classes = useStyles();
  const captures = useCaptures();

  const { boundaryId } = useParams<{ boundaryId?: string }>();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedCapture = captures.captures?.find(
    (i) => i.captureId === boundaryId,
  );

  const content = selectedCapture ? (
    <Typography variant="body2" style={{ textTransform: 'none' }}>
      Local Capture:{' '}
      {selectedCapture.startedAt &&
        timeAgo.format(new Date(selectedCapture.startedAt))}
    </Typography>
  ) : (
    <Typography variant="body2" style={{ textTransform: 'none' }}>
      Select Capture
    </Typography>
  );

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
      >
        {content}
        <ArrowDropDownIcon />
      </ToggleButton>
      <Menu
        elevation={1}
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ marginTop: 20 }}
      >
        {captures.captures.map((i, index) => (
          <CaptureMenuItem
            capture={i}
            key={index}
            onClick={() => {
              // if (index === 0) {
              //   history.push(documentationPageLink.linkTo());
              // } else {
              //   history.push(changelogPageRoute.linkTo(i.batchId));
              // }
            }}
          />
        ))}
      </Menu>
    </>
  );
}

function CaptureMenuItem({
  capture,
  onClick,
}: {
  capture: ICapture;
  onClick: () => void;
}) {
  return (
    <MenuItem onClick={onClick}>
      <Box display="flex" flexDirection="column">
        <Typography
          component="span"
          variant="subtitle1"
          style={{
            fontFamily: 'Ubuntu Mono',
            fontSize: 12,
            marginTop: -7,
            color: OpticBlueReadable,
          }}
        >
          Local Capture:{' '}
          {capture.startedAt && timeAgo.format(new Date(capture.startedAt))}
        </Typography>
      </Box>
    </MenuItem>
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
