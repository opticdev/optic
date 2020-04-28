import React from 'react';
import { storiesOf } from '@storybook/react';
import { mui } from './MUI';
// import {DiffHelperCard} from '../components/diff/v2/DiffHelperCard';

storiesOf('stories').add(
  'diff helper card',
  mui(
    (() => {
      return <div>Running storybook again</div>;
      // const reportStub = {};
      // return (
      //   <DiffHelperCard />
      // );
    })()
  )
);
