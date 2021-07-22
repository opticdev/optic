import React, { useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from '@material-ui/core';

import { FontFamily } from '<src>/styles';

type HttpBodySelectorProps<T> = {
  items: T[];
  children: (body: T) => React.ReactNode;
  getDisplayName: (item: T) => string;
};

/**
 * A component that is used to select / handle different items
 */
export const HttpBodySelector: <T extends {}>(
  props: HttpBodySelectorProps<T>
) => React.ReactElement = ({ items, children, getDisplayName }) => {
  const [selectedItem, setSelectedItem] = useState(0);
  const inBoundsSelected = Math.min(selectedItem, items.length - 1);
  const classes = useStyles();

  return (
    <>
      {items.length === 0 ? (
        <>No bodies found</>
      ) : items.length === 1 ? (
        children(items[0])
      ) : (
        <>
          <FormControl component="fieldset" className={classes.formGroup}>
            <RadioGroup
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(Number(e.target.value));
              }}
              className={classes.radioGroup}
            >
              {items.map((item, i) => (
                <FormControlLabel
                  classes={{
                    label: classes.radio,
                  }}
                  key={getDisplayName(item)}
                  value={i}
                  control={<Radio />}
                  label={getDisplayName(item)}
                />
              ))}
            </RadioGroup>
          </FormControl>
          {children(items[inBoundsSelected])}
        </>
      )}
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  formGroup: {
    marginBottom: theme.spacing(2),
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'row',
  },
  radio: {
    fontFamily: FontFamily,
    fontSize: theme.typography.fontSize - 1,
  },
}));
