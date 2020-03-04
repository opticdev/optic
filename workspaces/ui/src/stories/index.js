import React from 'react';
import {storiesOf} from '@storybook/react';
import {mui} from './MUI';
import DiffShapeViewer, {DiffToggleContextStore} from '../components/diff/v2/DiffShapeViewer';

storiesOf('contract testing dashboard')
  .add('main', mui((() => {

    const reportStub = {};

    return (
      <div>
        <DiffToggleContextStore>
          <DiffShapeViewer>
          </DiffShapeViewer>
        </DiffToggleContextStore>
      </div>
    );
  })()));
