import React from 'react';
import {Typography} from '@material-ui/core';
import {DocDivider, DocSubGroupHeadingStyles, ParametersStyles, SubHeadingStyles} from './DocConstants';
import {MarkdownContribution} from './DocContribution';

export function DocParameter({title, description, children}) {
  return (
    <div style={{maxWidth: 500}}>
      <div style={{paddingTop: 6, paddingBottom: 6, paddingLeft: 4}}>
        <div>
          <Typography variant="subtitle1" component="span" style={ParametersStyles}>{title}</Typography>
          <Typography component="span" style={{marginLeft: 6, fontSize: 12}}>String</Typography>
        </div>
        <MarkdownContribution value={description} label="Description"/>
      </div>
      <DocDivider/>
    </div>
  );
}
