import * as React from 'react';
import { ChangeEvent } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { TextField } from '@material-ui/core';
import classNames from 'classnames';

import { OpticBlueReadable } from '<src>/constants/theme';
import ReactMarkdown from 'react-markdown';
import {
  useAppSelector,
  useAppDispatch,
  documentationEditActions,
} from '<src>/store';

export type MarkdownBodyContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  initialValue: string;
  endpointId: string;
};

export function MarkdownBodyContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
  endpointId,
}: MarkdownBodyContributionProps) {
  const classes = useStyles();

  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  const inner = isEditing ? (
    <TextField
      inputProps={{ className: classNames(classes.contents, classes.editing) }}
      fullWidth
      variant="filled"
      multiline
      placeholder={defaultText}
      value={value}
      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        dispatch(
          documentationEditActions.addContribution({
            id,
            contributionKey,
            value,
            endpointId,
          })
        );
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
