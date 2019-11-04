import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {DocParameter} from './DocParameter';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';
import ListSubheader from '@material-ui/core/ListSubheader';
import {StickyRegion} from './StickyRegion';

export function DocResponse({
                              statusCode,
                              description,
                              contentType,
                              shapeId,
                              example,
                              responseId,
                              updateContribution
                            }) {

  const left = (
    <StickyRegion>
      <DocSubGroup title={statusCode + ' Response'}>
        <MarkdownContribution
          value={description}
          label="What does this response mean?"
          onChange={(value) => {
            updateContribution(responseId, 'body', value);
          }}/>
      </DocSubGroup>
    </StickyRegion>
  );

  const right = (shapeId && contentType) ? (
    <ExampleShapeViewer
      title={statusCode + ' Response Body'}
      shapeId={shapeId}
      contentType={contentType}
      example={example}/>
  ) : <div>No Body</div>;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
