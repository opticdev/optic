import React from 'react';

import {storiesOf} from '@storybook/react';
import PathInput from '../components/path-editor/PathInput.js';
import BasicButton from '../components/shape-editor/BasicButton';
import {mui} from './MUI';
import ShadowInput from '../components/shape-editor/ShadowInput';
import ShapePicker from '../components/shape-editor/ShapePicker';
import EndpointOverview from './doc-mode/EndpointOverview';
import {ExampleShapeViewer} from './doc-mode/DocCodeBox';
import EndpointPage from './doc-mode/EndpointPage';
import {Drawer} from '@material-ui/core';
import APIOverview from './doc-mode/ApiOverview';
import ConceptOverview from './doc-mode/ConceptOverview';

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
    return <ShapePicker/>;
  });

storiesOf('Doc mode component Library ')
  .add('endpoint overview', mui(
    <>
      <EndpointOverview
        endpointPurpose="Update a User's Preferences by ID"
        endpointDescription=""
        method="PATCH"
        parameters={['userId']}
        url="/users/:userId/preferences"

      />
    </>
  ))
  .add('concept overview', mui(
    <>
      <ConceptOverview
        name="Pet"
        description="A pet that you have"
        shapeId="shapeId"
        example={{name: 'fizo', age: 15, breed: 'husky'}}
      />
    </>
  ))
  .add('example / schema viewer', mui(
    <>
      <ExampleShapeViewer
        title="Request Body"
        shapeId='shapeId'
        example={{hello: 'world', favoriteNumber: 22, array: [1,2,3,4,5]}}/>
    </>
  ))
  .add('endpoint page', mui(
    <EndpointPage
      endpointPurpose="Delete User by ID"
      endpointDescription="Deletes a user based on the **userId** path parameter"
      method="DELETE"
      parameters={['userId']}
      url="/users/:userId"
    />
  ))
  .add('overview page', mui(
    <APIOverview />
  ))
