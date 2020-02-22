import React from 'react';
import {storiesOf} from '@storybook/react';
import {mui} from './MUI';
import TestingDashboard from '../components/dashboards/testing-dashboard/TestingDashboard';
import DiffViewer from '../components/diff/v2/DiffViewer';
import {DiffContextStore} from '../components/diff/v2/DiffContext';

storiesOf('contract testing dashboard')
  .add('main', mui((() => {

    const reportStub = {};

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

    return (
      <div>
        <DiffContextStore requestDiffs={diffs}>
          <DiffViewer />
        </DiffContextStore>
      </div>
    );
  })()));
