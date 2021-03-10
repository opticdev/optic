import { ToggleButton } from '@material-ui/lab';
import { Typography } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import { useContributionEditing } from './Contributions';
export function EditContributionsButton() {
  const classes = useStyles();

  const {
    isEditing,
    save,
    pendingCount,
    setEditing,
  } = useContributionEditing();

  const contents = !isEditing ? (
    <>
      <Typography variant="body2" style={{ textTransform: 'none' }}>
        Edit Descriptions
      </Typography>
      <EditIcon style={{ marginLeft: 3, height: 14 }} />
    </>
  ) : (
    <>
      <Typography variant="body2" style={{ textTransform: 'none' }}>
        {pendingCount === 0 ? 'Finish' : `Save (${pendingCount})`}
      </Typography>
      <SaveAltIcon color="secondary" style={{ marginLeft: 3, height: 14 }} />
    </>
  );
  return (
    <ToggleButton
      value="check"
      selected={isEditing}
      onClick={() => {
        isEditing ? save() : setEditing(true);
      }}
      size="small"
      className={classes.button}
    >
      {contents}
    </ToggleButton>
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
