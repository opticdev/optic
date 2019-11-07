import React from 'react';
import {DocSubGroup} from './DocSubGroup';
import {MarkdownContribution} from './DocContribution';
import {DocParameter} from './DocParameter';
import {ExampleShapeViewer} from './DocCodeBox';
import {DocGrid} from './DocGrid';
import ListSubheader from '@material-ui/core/ListSubheader';
import {StickyRegion} from './StickyRegion';
import {AddedGreen, Highlight} from './shape/HighlightedIDs';
import {STATUS_CODES} from 'http';
import {Typography} from '@material-ui/core';

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
      <DocSubGroup title={<Highlight id={responseId}
                                     style={{color: AddedGreen}}>{`${statusCode} - ${STATUS_CODES[statusCode]} Response`}</Highlight>}>
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
      showShapesFirst={showShapesFirst}
      example={example}/>
  ) : null;

  return <DocGrid left={left} right={right} style={{marginTop: 40}}/>;
}
