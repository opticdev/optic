import React from 'react'
import {Typography} from '@material-ui/core';
import {DocDivider, DocSubGroupHeadingStyles, SubHeadingStyles} from './DocConstants';
import Divider from '@material-ui/core/Divider';
export function DocSubGroup({title, children, style}) {
  return (
    <div style={{marginTop: 11, ...style}}>
      <div style={{maxWidth: 650}}>
      <Typography variant="overline" style={DocSubGroupHeadingStyles}>{title}</Typography>
      <DocDivider />
      </div>
      <div style={{maxWidth: 650}}>
      {children}
      </div>
    </div>
  )
}
