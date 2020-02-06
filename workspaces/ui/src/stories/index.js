import React from 'react';
import {storiesOf} from '@storybook/react';
import {mui} from './MUI';
import TestingDashboard from '../components/dashboards/testing-dashboard/TestingDashboard';
storiesOf('contract testing dashboard')
  .add('main', mui((() => {

    const reportStub = {};

    return (
        <div>
          <TestingDashboard report={reportStub}/>
        </div>
    );
  })()));
