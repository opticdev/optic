import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {DocParameter} from './DocParameter';
import {ExampleShapeViewer, ShapeOnly} from './DocCodeBox';
import {DocGrid} from './DocGrid';
import {NamerStore} from '../shapes/Namer';
import {DESCRIPTION} from '../../ContributionKeys';

export function DocQueryParams({shapeId, flatShape, getContribution, updateContribution}) {

  if (!shapeId || !flatShape || flatShape.root.fields.length === 0) {
    return null;
  }


  const left = (
    <DocSubGroup title={'Query Parameters'}>
      {flatShape.root.fields.map(i => {

        return (
          <DocParameter title={i.fieldName}
                        updateContribution={updateContribution}
                        paramId={i.fieldId}
                        description={getContribution(i.fieldId, DESCRIPTION)}/>
        );
      })}
    </DocSubGroup>
  );

  const right = (
      <ShapeOnly
        disableNaming={true}
        title={'Query Shape'}
        shapeId={shapeId}/>
  );

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
