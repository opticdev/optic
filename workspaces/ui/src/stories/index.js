import React from 'react';
import {storiesOf} from '@storybook/react';
import {mui} from './MUI';
import {DiffViewer, Row} from '../components/diff/v2/ShapeRows';

storiesOf('styles shape viewer')
  .add('row', mui((() => {
    const reportStub = {};
    return (
      <Row left="hello" right="world"/>
    );
  })()))

  .add('basic object', mui((() => {
    const reportStub = {};
    return (
      <DiffViewer shape={{
        fields: [
          {name: 'keyA', exampleValue: true, expectedType: 'String'},
          {name: 'keyB', exampleValue: 'akhgjds gdsgh dfhgjkafdshbc', expectedType: 'String'},
        ],
        baseShapeId: '$object'
      }}
      />
      )
    ;
  })()));
