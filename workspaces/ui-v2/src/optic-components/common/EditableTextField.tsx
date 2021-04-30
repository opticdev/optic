import React, { ChangeEvent, FC } from 'react';
import { TextField, Typography } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { OpticBlueReadable } from '../theme';

type EditableTextFieldProps = {
  isEditing: boolean;
  setEditing: (isEditing: boolean) => void;
  value: string;
  setValue: (newValue: string) => void;
  helperText?: string;
  defaultText?: string;
  variant: TextFieldVariant;
};

export enum TextFieldVariant {
  SMALL,
  REGULAR,
}

export const EditableTextField: FC<EditableTextFieldProps> = ({
  isEditing,
  setEditing,
  value,
  setValue,
  helperText,
  defaultText,
  variant,
}) => {
  const classes = useStyles();
  const isEmpty = !value.trim();
  const variants = {
    [TextFieldVariant.SMALL]: {
      inputProps: {
        autoComplete: 'off',
      },
      className: classes.smallField,
      textFieldStyle: { width: 300 },
    },
    [TextFieldVariant.REGULAR]: {
      inputProps: {},
      className: classes.regularField,
      textFieldStyle: {},
    },
  };

  return isEditing ? (
    <TextField
      inputProps={{
        className: variants[variant].className,
        ...variants[variant].inputProps,
      }}
      error={isEmpty}
      helperText={isEmpty ? helperText : undefined}
      fullWidth
      style={variants[variant].textFieldStyle}
      placeholder={defaultText}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      }}
    />
  ) : value ? (
    <Typography className={variants[variant].className}>{value}</Typography>
  ) : (
    <div onClick={() => setEditing(true)}>
      <Typography className={variants[variant].className}>
        {defaultText && (
          <span className={classes.defaultText}> + {defaultText}</span>
        )}
      </Typography>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  regularField: {
    fontSize: '1.25rem',
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  defaultText: {
    color: OpticBlueReadable,
    cursor: 'pointer',
  },
  smallField: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Ubuntu',
    pointerEvents: 'none',
    color: '#2a2f45',
  },
}));
