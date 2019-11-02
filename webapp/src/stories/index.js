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
import DiffPage from './doc-mode/DiffPage';
import CssBaseline from '@material-ui/core/CssBaseline';
import ShapeViewer from './doc-mode/shape/ShapeViewer';

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
  .add('diff page', mui(
    (<div>
      <CssBaseline/>
      <DiffPage />
    </div>),
    0))





function SHAPE(baseShapeId, typeName, fields = [], parameters = [], fieldName) {
  return {baseShapeId, typeName, fields, parameters, fieldName}
}

function NAME(name, shapeLink) {
  return {name, shapeLink}
}

const shapeValue =
  SHAPE('object', [NAME('Object')], [
    SHAPE('string', [NAME('String')], [], [], 'fieldA' ),
    SHAPE('string', [NAME('String')], [], [], 'fieldB' ),
    SHAPE('object', [NAME('Object')], [
      SHAPE('optional', [NAME('Option'), NAME('['), NAME('String', 'linkabc'), NAME(']')], [], [SHAPE('number', 'Number')], 'currency' ),
      SHAPE('optional', [NAME('Option'), NAME('['), NAME('String', 'linkabc'), NAME(']')], [], [SHAPE('string', 'String')], 'team' ),
    ], [], 'subobject' ),
  ])


storiesOf('Shape Viewer ')
  .add('normal', mui(
    (<ShapeViewer shape={shapeValue}  /> )
  ))
