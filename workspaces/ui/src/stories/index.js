import React from 'react';
import {storiesOf} from '@storybook/react';
import {mui} from './MUI';
import ReusableDiffRow from '../components/diff/v2/ReusableDiffRow';
import DiffNotification, {DiffRegion} from '../components/diff/v2/Notification';
import DiffDrawer from '../components/diff/v2/DiffDrawer';
import ContentTabs, {RequestTabsContextStore} from '../components/diff/v2/ContentTabs';

storiesOf('diff page')
  .add('resuable row for all diff page content', mui((() => {
    const reportStub = {};

    return (
      <ReusableDiffRow notifications={<div>ABC</div>}>
        <div style={{width: 400, backgroundColor: 'red'}}>Hello World</div>
      </ReusableDiffRow>
    );
  })()))
  .add('diff notification types', mui((() => {
    const reportStub = {};
    return (
      <DiffRegion>
        <DiffNotification diff={{title: 'Optic Observed A Change', changeType: 'Addition'}}/>
        <DiffNotification diff={{title: 'Type is not correct', changeType: 'Update'}}/>
      </DiffRegion>
    );
  })()))
  .add('diff drawer ', mui((() => {
    return (
      <DiffDrawer/>
    );
  })()))
  .add('custom tabs ', mui((() => {
    return (
      <RequestTabsContextStore>
        <ContentTabs options={[
          {statusCode: 200, contentTypes: ['text/html', 'application/json']},
          {statusCode: 204, contentTypes: ['text/html']}
        ]}/>
      </RequestTabsContextStore>
    );
  })()));
