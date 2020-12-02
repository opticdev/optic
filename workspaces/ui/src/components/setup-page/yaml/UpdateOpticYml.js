import React, { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
  SubtleBlueBackground,
  UpdatedBlue,
  UpdatedBlueBackground,
} from '../../../theme';
import { rangesFromOpticYaml } from './YamlHelper';
import { Paper, Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

export function ShowCurrentOpticYml({
  rawConfig,
  saving,
  ranges,
  result,
  updateValue,
}) {
  const classes = useStyles();

  const computedMarkers = (() => {
    const markers = [];

    function highlightX(keyValue, key) {
      if (keyValue) {
        const colorClass = (() => {
          if (key === 'command' && result && result.recommended) {
            const {
              commandIsLongRunning,
              apiProcessStartsOnAssignedHost,
              apiProcessStartsOnAssignedPort,
            } = result.recommended;

            if (
              !commandIsLongRunning.passed ||
              !apiProcessStartsOnAssignedHost.passed ||
              !apiProcessStartsOnAssignedPort.passed
            ) {
              return classes.highlightError;
            } else {
              return classes.highlightCorrect;
            }
          }

          if (key === 'inboundUrl' && result && result.recommended) {
            const { proxyCanStartAtInboundUrl } = result.recommended;

            if (!proxyCanStartAtInboundUrl.passed) {
              return classes.highlightError;
            } else {
              return classes.highlightCorrect;
            }
          }

          return classes.highlightRowFocus;
        })();

        markers.push({
          startRow: keyValue.startLine,
          startCol: 0,
          endRow: keyValue.endLine,
          endCol: 1000,
          className: colorClass,
          type: 'text',
        });
      }
    }

    highlightX(ranges.task && ranges.task.command, 'command');
    highlightX(ranges.task && ranges.task.inboundUrl, 'inboundUrl');

    return markers;
  })();

  const lineCount = splitLines(rawConfig).length;

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
        style={{
          width: '100%',
          height: lineCount < 15 ? 400 : 600,
          opacity: saving ? 0.5 : 1,
        }}
        mode="yaml"
        theme="solarized_dark"
        value={rawConfig}
        fontSize={15}
        showPrintMargin={false}
        readOnly={saving}
        showGutter={true}
        highlightActiveLine={false}
        onChange={(value) => updateValue(value)}
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
  highlightRowFocus: {
    backgroundColor: ChangedYellowBackground,
    position: 'absolute',
    borderRadius: 0,
    padding: 0,
    width: '100% !important',
    left: 0,
    margin: 0,
  },
  highlightError: {
    backgroundColor: RemovedRedBackground,
    position: 'absolute',
    borderRadius: 0,
    padding: 0,
    width: '100% !important',
    left: 0,
    margin: 0,
  },
  highlightCorrect: {
    backgroundColor: AddedGreenBackground,
    position: 'absolute',
    borderRadius: 0,
    padding: 0,
    width: '100% !important',
    left: 0,
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
