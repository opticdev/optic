import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {DocParameter} from './DocParameter';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';

export function DocResponse({
                              statusCode,
                              description,
                              fields = [],
                              contentType,
                              shapeId,
                              example
                            }) {

  const left = (
    <DocSubGroup title={statusCode + ' Response'}>
      <MarkdownContribution value={description} label="What does this response mean?"/>
      {fields.length ? (
        <DocSubGroup title={'Fields'}>
          {fields.map(i => <DocParameter title={i.title} description={i.description}/>)}
        </DocSubGroup>
      ) : null}
    </DocSubGroup>
  );

  const right = <ExampleShapeViewer
    title={statusCode + ' Response Body'}
    shapeId={shapeId}
    contentType={contentType}
    example={example}/>;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
