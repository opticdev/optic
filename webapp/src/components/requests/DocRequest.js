import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';
import {StickyRegion} from '../shared/StickyRegion';
import {BODY_DESCRIPTION} from '../../ContributionKeys';

export function DocRequest({
                             description,
                             contentType,
                             shapeId,
                             example,
                             requestId,
                             updateContribution,
                             showShapesFirst
                           }) {

  const left = (
    <StickyRegion>
      <DocSubGroup title={'Request'}>
        <MarkdownContribution
          value={description}
          label="What should be in the request?"
          onChange={(value) => {
            updateContribution(requestId, BODY_DESCRIPTION, value);
          }}/>
      </DocSubGroup>
    </StickyRegion>
  );

  const right = <ExampleShapeViewer
    title={'Request Body'}
    shapeId={shapeId}
    contentType={contentType}
    showShapesFirst={showShapesFirst}
    example={example}/>;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
