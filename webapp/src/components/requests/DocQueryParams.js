import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {DocParameter} from './DocParameter';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';

export function DocQueryParams({
                                 parameters = [],
                                 shapeId,
                                 example
                               }) {


  if (parameters.length === 0) {
    return null;
  }

  const left = (
    <DocSubGroup title={'Query Parameters'}>
      {parameters.map(i => <DocParameter title={i.title} description={i.description}/>)}
    </DocSubGroup>
  );

  const right = <ExampleShapeViewer
    title={'Query Parameters'}
    shapeId={shapeId}
    example={example}/>;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
