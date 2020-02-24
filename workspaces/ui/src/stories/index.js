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

<<<<<<< Updated upstream
storiesOf('large shapes')
  .add('basic', mui((() => {
=======
    return (
      <div>
        <TestingDashboard report={reportStub}/>
      </div>
    );
  })()));

storiesOf('new diff page')
  .add('diff viewer', mui((() => {

    const diffs = [
      {
        title: 'Unexpected field \'hello\' observed',
        diffHash: 'a',
        group: 'query',
        interpretations: [
          {'action': 'Add field \'hello\''},
          {'action': 'Make parent field a Map[String, OneOf[String, Number]]'},
        ],
        interactions: [

        ]
      },
      {
        title: 'Missing expected field \'goodbye\'',
        diffHash: 'ab',
        group: 'requestBody',
        interpretations: [
          {'action': 'Make field \'goodbye\' optional'},
          {'action': 'Remove field \'goodbye\''},
        ]
      },
      {
        title: 'Value for \'monkey\' was not a number',
        diffHash: 'abc',
        group: 'requestBody',
        interpretations: [
          {'action': 'Make field \'monkey\' a string'},
          {'action': 'Remove field \'monkey\' OneOf[String, Number]'},
        ]
      },
    ];
>>>>>>> Stashed changes

    return (
      <div>
        <TextF/>

      </div>
    );
  })()));
