import * as React from 'react';
import { ChangeEvent } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { TextField } from '@material-ui/core';
import classNames from 'classnames';
import {
  useContributionEditing,
  useValueWithStagedContributions,
} from '../hooks/edit/Contributions';
import { OpticBlueReadable } from '../theme';
import ReactMarkdown from 'react-markdown';

export type MarkdownBodyContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  initialValue: string;
};

export function MarkdownBodyContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
}: MarkdownBodyContributionProps) {
  const { isEditing } = useContributionEditing();

  const classes = useStyles();
  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  const inner = isEditing ? (
    <TextField
      inputProps={{ className: classNames(classes.contents, classes.editing) }}
      fullWidth
      variant="filled"
      multiline
      placeholder={defaultText}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      }}
    />
  ) : (
    <ReactMarkdown className={classes.contents} source={value || ''} />
  );

  return <div>{inner}</div>;
}

const useStyles = makeStyles((theme) => ({
  contents: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4f566b',
    paddingRight: 50,
  },
  editing: {
    fontFamily: 'Ubuntu Mono',
    fontWeight: 100,
  },
  defaultText: {
    color: OpticBlueReadable,
    cursor: 'pointer',
  },
}));
