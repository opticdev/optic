import React from 'react';

import {storiesOf} from '@storybook/react';
import PathInput from '../components/path-editor/PathInput.js';
import BasicButton from '../components/shape-editor/BasicButton';
import {mui} from './MUI';
import ShadowInput from '../components/shape-editor/ShadowInput';
import ShapePicker from '../components/shape-editor/ShapePicker';
import EndpointOverview from './doc-mode/EndpointOverview';
import {ExampleOnly, ExampleShapeViewer} from './doc-mode/DocCodeBox';
import EndpointPage from './doc-mode/EndpointPage';
import {Drawer} from '@material-ui/core';
import APIOverview from './doc-mode/ApiOverview';
import ConceptOverview from './doc-mode/ConceptOverview';
import DiffPage from './doc-mode/DiffPage';
import CssBaseline from '@material-ui/core/CssBaseline';
import ShapeViewer from './doc-mode/shape/ShapeViewer';
import {InitialRfcCommandsStore} from '../contexts/InitialRfcCommandsContext';
import {LocalRfcStore} from '../contexts/RfcContext';
import {HighlightedIDsStore} from './doc-mode/shape/HighlightedIDs';

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
      <DiffPage
        url={'/users/aidan'}
        method={'put'}
        path={'/users/:userId'}
        observed={{
          statusCode: 200,
          requestBody: {example: true},
          responseBody: {responseExample: true}
        }}
        expected={{
          requestBodyShapeId: undefined,
          responseBodyShapeId: undefined
        }}
        remainingInteractions={2}
      />
    </div>),
    0))




const flatShape = {
  "root" : {
    "baseShapeId" : "$object",
    "typeName" : [
      {
        "name" : "Object",
        "colorKey" : "primitive",
        "shapeLink" : "pa_0",
        "primitiveId" : "$object"
      }
    ],
    "fields" : [
      {
        "fieldName" : "c",
        "shape" : {
          "baseShapeId" : "$object",
          "typeName" : [
            {
              "name" : "Object",
              "colorKey" : "primitive",
              "shapeLink" : "pa_2",
              "primitiveId" : "$object"
            }
          ],
          "fields" : [
            {
              "fieldName" : "bool-key",
              "shape" : {
                "baseShapeId" : "$boolean",
                "typeName" : [
                  {
                    "name" : "Boolean",
                    "colorKey" : "primitive",
                    "shapeLink" : null,
                    "primitiveId" : "$boolean"
                  }
                ],
                "fields" : [
                ],
                "id" : "pa_4",
                "canName" : false
              },
              "fieldId" : "pa_3"
            },
            {
              "fieldName" : "nested",
              "shape" : {
                "baseShapeId" : "$object",
                "typeName" : [
                  {
                    "name" : "Object",
                    "colorKey" : "primitive",
                    "shapeLink" : "pa_6",
                    "primitiveId" : "$object"
                  }
                ],
                "fields" : [
                  {
                    "fieldName" : "desc",
                    "shape" : {
                      "baseShapeId" : "$string",
                      "typeName" : [
                        {
                          "name" : "String",
                          "colorKey" : "primitive",
                          "shapeLink" : null,
                          "primitiveId" : "$string"
                        }
                      ],
                      "fields" : [
                      ],
                      "id" : "pa_8",
                      "canName" : false
                    },
                    "fieldId" : "pa_7"
                  }
                ],
                "id" : "pa_6",
                "canName" : true
              },
              "fieldId" : "pa_5"
            },
            {
              "fieldName" : "number-key",
              "shape" : {
                "baseShapeId" : "$number",
                "typeName" : [
                  {
                    "name" : "Number",
                    "colorKey" : "primitive",
                    "shapeLink" : null,
                    "primitiveId" : "$number"
                  }
                ],
                "fields" : [
                ],
                "id" : "pa_10",
                "canName" : false
              },
              "fieldId" : "pa_9"
            }
          ],
          "id" : "pa_2",
          "canName" : true
        },
        "fieldId" : "pa_1"
      }
    ],
    "id" : "pa_0",
    "canName" : true
  },
  "parameterMap" : {

  }
}


storiesOf('Shape Viewer ')
  .add('examples...', mui(
    (<HighlightedIDsStore><ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap}/></HighlightedIDsStore>)
  ))
