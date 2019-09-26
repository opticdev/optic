import React from 'react';

import {storiesOf} from '@storybook/react';
import PathInput from '../components/path-editor/PathInput.js';
import BasicButton from '../components/shape-editor/BasicButton';
import {mui} from './MUI';
import ShadowInput from './ShadowInput';
import ShapePicker from './ShapePicker';


storiesOf('Shadow Input')
  .add('basic', () => {
    return <ShadowInput
      options={[
        {label: 'List', value: '$list'},
        {label: 'Object', value: '$object'},
        {label: 'String', value: '$string'},
      ]}
      onChange={(m) => alert(JSON.stringify(m))}
    />;
  });

storiesOf('Shape Picker ')
  .add('basic', () => {
    return <ShapePicker />;
  });
