import * as React from 'react';
import { ChangeEvent } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { TextField } from '@material-ui/core';
import classNames from 'classnames';

import { OpticBlueReadable } from '<src>/styles';
import ReactMarkdown from 'react-markdown';
import {
  useAppSelector,
  useAppDispatch,
  selectors,
  documentationEditActions,
} from '<src>/store';
import { getEndpointId } from '<src>/utils';

export type MarkdownBodyContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  initialValue: string;
  endpoint: {
    method: string;
    pathId: string;
  };
};

export function MarkdownBodyContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
  endpoint,
}: MarkdownBodyContributionProps) {
  const endpointId = getEndpointId(endpoint);
  const classes = useStyles();

  const isEditable = useAppSelector(selectors.isEndpointEditable(endpoint));
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  const inner = isEditable ? (
    <TextField
      inputProps={{ className: classNames(classes.contents, classes.editing) }}
      fullWidth
      variant="filled"
      multiline
      placeholder={defaultText}
      value={value}
      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        if (initialValue === value) {
          dispatch(
            documentationEditActions.removeContribution({
              id,
              contributionKey,
            })
          );
        } else {
          dispatch(
            documentationEditActions.addContribution({
              id,
              contributionKey,
              value,
              endpointId,
            })
          );
        }
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
