import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';
import {StickyRegion} from '../shared/StickyRegion';
import {STATUS_CODES} from 'http';
import {BODY_DESCRIPTION} from '../../ContributionKeys';

export function DocResponse({
                              statusCode,
                              description,
                              contentType,
                              shapeId,
                              example,
                              responseId,
                              updateContribution,
                              showShapesFirst
                            }) {

  const left = (
    <StickyRegion>
      <DocSubGroup title={`${statusCode} - ${STATUS_CODES[statusCode]} Response`}>
        <MarkdownContribution
          value={description}
          label="What does this response mean?"
          onChange={(value) => {
            updateContribution(responseId, BODY_DESCRIPTION, value);
          }}/>
      </DocSubGroup>
    </StickyRegion>
  );

  const right = (shapeId && contentType) ? (
    <ExampleShapeViewer
      title={statusCode + ' Response Body'}
      shapeId={shapeId}
      contentType={contentType}
      showShapesFirst={showShapesFirst}
      example={example}/>
  ) : null;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
