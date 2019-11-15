import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

const styles = theme => ({
  root: {},
});

function TypeModal({value, onChange}) {

  return (
    <AceEditor
      mode="json"
      theme="github"
      tabSize={2}
      showPrintMargin={false}
      width={'90%'}
      onChange={onChange}
      value={value}
      editorProps={{$blockScrolling: true}}
    />
  );
}

export default withStyles(styles)(TypeModal);
