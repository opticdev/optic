import React, { useState } from 'react';
import { ToggleButton } from '@material-ui/lab';
import { Typography, makeStyles } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import EditIcon from '@material-ui/icons/Edit';
import { useContributionEditing } from '../../hooks/edit/Contributions';
import { CommitMessageModal } from '../../common';

export function EditContributionsButton() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

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
    <>
      <ToggleButton
        value="check"
        selected={isEditing}
        onClick={() => {
          isEditing
            ? pendingCount > 0
              ? setOpen(true)
              : setEditing(false)
            : setEditing(true);
        }}
        size="small"
        className={classes.button}
      >
        {contents}
      </ToggleButton>
      <CommitMessageModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={save}
        dialogText={`You have ${pendingCount} ${
          pendingCount === 1 ? 'change' : 'changes'
        }.`}
      />
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
