import React, { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  ChangedYellowBackground,
  RemovedRedBackground,
  SubtleBlueBackground,
  UpdatedBlue,
  UpdatedBlueBackground,
} from '../../../theme';
import { rangesFromOpticYaml } from '../yaml/YamlHelper';
import { Paper, Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

export function ShowCurrentOpticYml({
  focusTask,
  rawConfig,
  commandIsInvalid,
}) {
  const classes = useStyles();

  const [currentValue, setCurrentValue] = useState(rawConfig);

  const computedMarkers = useMemo(() => {
    const components = rangesFromOpticYaml(currentValue, focusTask);
    console.log(components);
    const markers = [];

    function highlightX(keyValue) {
      if (keyValue) {
        markers.push({
          startRow: keyValue.startLine,
          startCol: 0,
          endRow: keyValue.endLine,
          endCol: 100,
          className: classes.highlightRowFocus,
          type: 'text',
        });
      }
    }

    highlightX(components.task && components.task.command);
    highlightX(components.task && components.task.inboundUrl);

    return markers;
  }, [currentValue]);

  const debouncedValue = useDebounce(currentValue, 500);

  useEffect(() => {
    if (debouncedValue) {
      console.log('new value', debouncedValue);
    }
  }, [debouncedValue]);

  const lineCount = splitLines(currentValue).length;

  return (
    <Paper elevation={3} className={classes.bg}>
      <div className={classes.header}>
        <Typography
          variant="overline"
          style={{ textTransform: 'none', color: SubtleBlueBackground }}
        >
          optic.yml
        </Typography>
      </div>
      <AceEditor
        style={{ width: '100%', height: lineCount < 15 ? 400 : 600 }}
        mode="yaml"
        theme="solarized_dark"
        value={currentValue}
        fontSize={15}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={false}
        onChange={(value) => setCurrentValue(value)}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        markers={computedMarkers}
      />
    </Paper>
  );
}

function splitLines(t) {
  return t.split(/\r\n|\r|\n/);
}

const useStyles = makeStyles((theme) => ({
  highlightRow: {
    backgroundColor: RemovedRedBackground,
    position: 'absolute',
    borderRadius: 0,
    padding: 0,
    margin: 0,
  },
  highlightRowFocus: {
    backgroundColor: ChangedYellowBackground,
    position: 'absolute',
    borderRadius: 0,
    padding: 0,
    margin: 0,
  },
  bg: {
    backgroundColor: '#0e2a35',
  },
  header: {
    paddingLeft: 9,
    borderBottomColor: '#736d6d',
    borderBottom: `1px solid`,
    marginBottom: 12,
  },
}));

function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
