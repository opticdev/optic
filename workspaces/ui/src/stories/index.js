import React from 'react';
import {storiesOf} from '@storybook/react';
import {mui} from './MUI';

storiesOf('styles shape viewer')
  .add('row', mui((() => {
    const reportStub = {};
    return (
      <div>hello world</div>
    );
  })()))
