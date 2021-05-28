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
import { useHistory } from 'react-router-dom';
import { useCaptures } from '<src>/hooks/useCapturesHook';
import { OpticBlueReadable } from '<src>/constants/theme';
import { useDiffEnvironmentsRoot } from '<src>/components';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export function CaptureSelectDropdown(props: any) {
  const classes = useStyles();
  const captures = useCaptures();
  const history = useHistory();
  const { boundaryId } = useParams<{ boundaryId?: string }>();
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedCapture = captures.captures?.find(
    (i) => i.captureId === boundaryId
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
        {captures.captures.map((capture) => (
          <MenuItem
            key={capture.captureId}
            onClick={() => {
              history.push(
                diffEnvironmentsRoot.linkTo('local', capture.captureId) +
                  '/review'
              );
              handleClose();
            }}
          >
            <CaptureMenuItem capture={capture} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function CaptureMenuItem({ capture }: { capture: ICapture }) {
  return (
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
