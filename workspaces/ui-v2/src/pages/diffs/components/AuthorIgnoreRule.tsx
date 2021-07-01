import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { SubtleBlueBackground } from '<src>/styles';
import TextField from '@material-ui/core/TextField';
import InfoIcon from '@material-ui/icons/Info';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { IUndocumentedUrl } from '<src>/pages/diffs/contexts/SharedDiffState';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { useUndocumentedUrls } from '<src>/pages/diffs/hooks/useUndocumentedUrls';
import { EndpointName } from '<src>/components';
import { Button, Typography } from '@material-ui/core';
import { parseRule } from '@useoptic/cli-config/build/helpers/ignore-parser';
import { LightTooltip } from '<src>/components';

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
          className={classes.textContainer}
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
        <div className={classes.infoIcon}>
          <LightTooltip
            interactive
            title={
              <div>
                Want to match a pattern? See our{' '}
                <a
                  href="https://www.useoptic.com/docs/using/advanced-configuration/#ignoring-api-paths"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ignore rules helper link
                </a>
                .
              </div>
            }
          >
            <InfoIcon />
          </LightTooltip>
        </div>
        <Button
          disabled={!validRule}
          className={classes.addRule}
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
              {matchingPreview.slice(0, 3).map((i) => (
                <EndpointName
                  key={`${i.method}${i.path}`}
                  leftPad={0}
                  method={i.method}
                  fullPath={i.path}
                />
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
  textContainer: {
    padding: '0 8px',
  },
  infoIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  addRule: {
    minWidth: 100,
  },
}));
