import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';

const styles = theme => ({
  root: {},
});

function YamlEditor({value, onChange}) {
  return (
    <AceEditor
      mode="yaml"
      theme="github"
      tabSize={2}
      showPrintMargin={false}
      width={'90%'}
      height={350}
      onChange={onChange}
      value={value}
      editorProps={{$blockScrolling: true}}
    />
  );
}

export default withStyles(styles)(YamlEditor);
