import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {DocParameter} from './DocParameter';
import {ShapeOnly} from './DocCodeBox';
import {DocGrid} from '../shared/DocGrid';
import {DESCRIPTION} from '../../ContributionKeys';

export function DocQueryParams({shapeId, flatShape, getContribution, updateContribution}) {

  if (!shapeId || !flatShape || flatShape.root.fields.length === 0) {
    return null;
  }


  const left = (
    <DocSubGroup title={'Query Parameters'}>
      {flatShape.root.fields.map(i => {

        const joinedType = i.shape.typeName.map(tn => tn.name).join(' ')

        return (
          <DocParameter title={i.fieldName}
                        typeName={joinedType}
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
