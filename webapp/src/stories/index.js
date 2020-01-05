import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import ShapeViewer, {ExampleViewer} from '../components/shapes/ShapeViewer';
import {mui} from './MUI';
import {HighlightedIDsStore} from '../components/shapes/HighlightedIDs';
import TextField from '@material-ui/core/TextField';

console.time('loading colors');
const colors = require('./colors');
console.timeEnd('loading colors');

function TextF({}) {
  const [text, setText] = useState('');
  return (
    <div>
      <TextField autoFocus value={text} onChange={(e) => setText(e.target.value)}/>
      <HighlightedIDsStore  addedIds={[]} changedIds={[]} expand={false}>
        <ShapeViewer shape={colors.root} parameters={colors.parametersMap}/>
      </HighlightedIDsStore>
    </div>
  );
}

storiesOf('large shapes')
  .add('basic', mui((() => {

    return (
      <div>
        <TextF/>

      </div>
    );
  })()));
