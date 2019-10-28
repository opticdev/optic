import React from 'react'
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {DocParameter} from './DocParameter';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';

export function DocRequest({description,
                           fields = [],
                           contentType,
                           shapeId,
                           example}) {

  const left = (
    <DocSubGroup title={"Request"}>
      <MarkdownContribution value={description} label="What should be in the request?"/>
      {fields.length ? (
        <DocSubGroup title={'Fields'}>
          {fields.map(i => <DocParameter title={i.title} description={i.description}/>)}
        </DocSubGroup>
      ) : null}
    </DocSubGroup>
  );

  const right = <ExampleShapeViewer
    title={"Request Body"}
    shapeId={shapeId}
    contentType={contentType}
    example={example}/>;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>
}
