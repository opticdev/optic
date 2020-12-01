import React, { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { RemovedRedBackground } from '../../../theme';

export function ShowCurrentOpticYml({ rawConfig, commandIsInvalid }) {
  const classes = useStyles();

  const [currentValue, setCurrentValue] = useState(rawConfig);

  console.log('val', currentValue);
  const debouncedValue = useDebounce(currentValue, 500);

  useEffect(() => {
    if (debouncedValue) {
      console.log('new value', debouncedValue);
    }
  }, [debouncedValue]);

  const computedMarkers = (() => {
    const lines = splitLines(currentValue);
    const markers = [];
    lines.forEach((i, index) => {
      if (i.trim().startsWith('command:') && commandIsInvalid) {
        markers.push({
          startRow: index,
          startCol: 0,
          endRow: index,
          endCol: i.length,
          className: classes.highlightRow,
          type: 'text',
        });
      }
    });
    return markers;
  })();

  return (
    <>
      <AceEditor
        style={{ width: '100%', height: 200 }}
        mode="yaml"
        theme="github"
        value={currentValue}
        highlightActiveLine={false}
        onChange={(value) => setCurrentValue(value)}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        markers={computedMarkers}
      />
    </>
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
