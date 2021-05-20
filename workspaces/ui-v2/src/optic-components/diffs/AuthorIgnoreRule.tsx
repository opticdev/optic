import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { SubtleBlueBackground } from '../theme';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useUndocumentedUrls } from '../hooks/diffs/useUndocumentedUrls';
import { IUndocumentedUrl } from '../hooks/diffs/SharedDiffState';
import { EndpointName } from '../common';
import { Button, Typography } from '@material-ui/core';
import { parseRule } from '@useoptic/cli-config/build/helpers/ignore-parser';
import { useSharedDiffContext } from '../hooks/diffs/SharedDiffContext';

export function AuthorIgnoreRules() {
  const classes = useStyles();
  const observedUrls = useUndocumentedUrls();

  const { addPathIgnoreRule } = useSharedDiffContext();

  const urlOptions = useMemo(() => observedUrls.filter((i) => !i.hide), [
    observedUrls,
  ]);

  const [pendingIgnore, setPendingIgnore] = useState('');
  const [matchingPreview, setMatchingPreview] = useState<IUndocumentedUrl[]>(
    []
  );
  const [hasFocus, setHasFocus] = useState(false);
  const ignoreRuleParsed = parseRule(pendingIgnore);

  const validRule = pendingIgnore !== '' && !!ignoreRuleParsed;
  const invalidRegex = pendingIgnore !== '' && !ignoreRuleParsed;

  const reset = () => {
    setPendingIgnore('');
    setMatchingPreview([]);
    setHasFocus(false);
  };

  const finishAdding = () => {
    addPathIgnoreRule(pendingIgnore);
    reset();
  };

  useEffect(() => {
    reset();
  }, [urlOptions.length]);

  return (
    <div className={classes.toolbar}>
      <div className={classes.top}>
        <Autocomplete
          options={urlOptions}
          size="small"
          onInputChange={(event, value) => {
            // Because we are going "freeSolo", the pressing enter with
            // no valid inputs will return us `undefined undefined`
            if (value === 'undefined undefined') {
              return;
            }
            setPendingIgnore(value);
            const parsedRule = parseRule(value);
            if (parsedRule) {
              setMatchingPreview(
                urlOptions.filter(({ method, path }) =>
                  parsedRule.shouldIgnore(method, path)
                )
              );
            }
          }}
          freeSolo={true}
          fullWidth={true}
          inputValue={pendingIgnore}
          onOpen={() => setHasFocus(true)}
          onClose={() => setHasFocus(false)}
          getOptionLabel={(option) => `${option.method} ${option.path}`}
          renderOption={(option) => (
            <EndpointName
              key={`${option.method} ${option.path}`}
              leftPad={0}
              method={option.method}
              fullPath={option.path}
            />
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add Ignore Rule"
              variant="outlined"
              size="small"
            />
          )}
        />
        <Button
          disabled={!validRule}
          style={{ minWidth: 100, marginLeft: 10, marginTop: 2 }}
          color="primary"
          size="medium"
          onClick={finishAdding}
        >
          Add Rule
        </Button>
      </div>
      {(hasFocus || Boolean(pendingIgnore)) && (
        <div className={classes.previewRegion}>
          {invalidRegex && (
            <Typography
              color="error"
              variant="caption"
            >{`invalid regex in rule`}</Typography>
          )}
          {validRule && matchingPreview.length === 0 ? (
            <Typography
              color="error"
              variant="caption"
            >{`no observed URLs match this rule`}</Typography>
          ) : null}
          {validRule && matchingPreview.length ? (
            <>
              <Typography variant="caption">{`matches these paths ${
                matchingPreview.length > 3
                  ? `and ${matchingPreview.length - 3} more`
                  : ''
              }:`}</Typography>
              {matchingPreview.slice(0, 3).map((i, index) => (
                <EndpointName leftPad={0} method={i.method} fullPath={i.path} />
              ))}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  toolbar: {
    padding: 9,
    backgroundColor: SubtleBlueBackground,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'row',
    borderTop: '1px solid #e2e2e2',
    maxHeight: 200,
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
  },
  previewRegion: {
    minHeight: 60,
    paddingLeft: 5,
  },
}));
