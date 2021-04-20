import React, { useEffect, useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import { ICopyRender } from './ICopyRender';
import { ICoreShapeKinds, IPatchChoices } from '../../../lib/Interfaces';
import { makeStyles } from '@material-ui/styles';
import deepCopy from 'deepcopy';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@material-ui/core';
import { OpticBlueReadable, SubtleBlueBackground } from '../../theme';
import { namerForOptions } from '../../../lib/quick-namer';
import { ArrowRight } from '@material-ui/icons';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';

type IBuildSpecPatch = {
  patchChoices: IPatchChoices;
  diffHash: string;
  onPathChoicesUpdated: (pathChoices: IPatchChoices) => void;
  approved: () => void;
};

export function BuildSpecPatch({
  patchChoices,
  onPathChoicesUpdated,
  diffHash,
  approved,
}: IBuildSpecPatch) {
  const classes = useStyles();
  const { addDiffHashIgnore } = useSharedDiffContext();

  const [selectedChoices, setSelectedChoices] = useState(
    deepCopy(patchChoices),
  );

  useEffect(() => {
    onPathChoicesUpdated(selectedChoices);
  }, [selectedChoices, onPathChoicesUpdated]);

  const updateShapeChoice = (coreShape: ICoreShapeKinds, valid: boolean) => {
    const copied = deepCopy(selectedChoices);
    copied.shapes.forEach((i) => {
      if (i.coreShapeKind === coreShape) i.isValid = valid;
    });

    setSelectedChoices(copied);
  };

  return (
    <FormControl component="fieldset" style={{ width: '100%', paddingLeft: 5 }}>
      <Typography variant="body1" className={classes.heading}>
        <ICopyRender
          variant="body1"
          style={{ fontFamily: 'Ubuntu Mono', color: OpticBlueReadable }}
          copy={patchChoices.copy}
        />
      </Typography>

      <FormGroup>
        {selectedChoices.shapes.map((shape, index) => {
          return (
            <FormControlLabel
              key={index}
              labelPlacement="end"
              control={
                <Checkbox
                  size="small"
                  checked={shape.isValid}
                  onChange={(event, checked) =>
                    updateShapeChoice(shape.coreShapeKind, checked)
                  }
                />
              }
              label={
                <Typography variant="body1" className={classes.checkboxLabel}>
                  {namerForOptions([shape.coreShapeKind]).toLowerCase()}
                </Typography>
              }
            />
          );
        })}
        {patchChoices.isField && (
          <FormControlLabel
            label={
              <Typography variant="body1" className={classes.checkboxLabel}>
                this field is optional
              </Typography>
            }
            labelPlacement="end"
            control={
              <Checkbox
                size="small"
                checked={selectedChoices.isOptional}
                onChange={(event, checked) => {
                  const copied = deepCopy(selectedChoices);
                  copied.isOptional = checked;
                  setSelectedChoices(copied);
                }}
              />
            }
          />
        )}

        <Divider style={{ marginTop: 10, marginBottom: 12 }} />

        <div style={{ marginBottom: 5 }}>
          <Box display="flex" justifyContent="center">
            <Button
              size="small"
              style={{ color: OpticBlueReadable }}
              onClick={() => {
                addDiffHashIgnore(diffHash);
              }}
            >
              Ignore Diff
            </Button>
            <Button size="small" style={{ color: OpticBlueReadable }}>
              Create Bug Report
            </Button>
            <div style={{ flex: 1 }} />
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowRight />}
              size="small"
              style={{ marginRight: 15 }}
              onClick={approved}
            >
              Save Changes
            </Button>
          </Box>
        </div>
      </FormGroup>
    </FormControl>
  );
}
const useStyles = makeStyles((theme) => ({
  labelGroup: {
    display: 'flex',
    flexDirection: 'row',
    paddingRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    width: '100%',
  },
  heading: {
    fontFamily: 'Ubuntu Mono',
    color: OpticBlueReadable,
  },
  active: {
    backgroundColor: SubtleBlueBackground,
    border: '1px solid #e2e2e2',
    boxSizing: 'content-box',
  },
  checkboxLabel: {
    fontFamily: 'Ubuntu Mono',
    fontSize: 15,
    userSelect: 'none',
  },
}));
