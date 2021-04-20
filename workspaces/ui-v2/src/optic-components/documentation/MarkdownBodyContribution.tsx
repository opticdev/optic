import * as React from 'react';
import { ChangeEvent, useEffect, useState } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { TextField } from '@material-ui/core';
import classNames from 'classnames';
import { useDebounce } from '../hooks/ui/useDebounceHook';
import { useContributionEditing } from '../hooks/edit/Contributions';
import { OpticBlueReadable } from '../theme';
import ReactMarkdown from 'react-markdown';

export type MarkdownBodyContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
};

export function MarkdownBodyContribution({
  id,
  contributionKey,
  defaultText,
}: MarkdownBodyContributionProps) {
  const {
    lookupContribution,
    isEditing,
    stagePendingContribution,
  } = useContributionEditing();

  const value = lookupContribution(id, contributionKey);
  const classes = useStyles();

  const [stagedValue, setStagedValue] = useState(value);

  const debouncedChanges = useDebounce(stagedValue, 1000);

  useEffect(() => {
    if (debouncedChanges && stagedValue !== value) {
      stagePendingContribution(id, contributionKey, debouncedChanges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedChanges]);

  const inner = isEditing ? (
    <TextField
      inputProps={{ className: classNames(classes.contents, classes.editing) }}
      fullWidth
      variant="filled"
      multiline
      placeholder={defaultText}
      value={stagedValue}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setStagedValue(e.target.value);
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
