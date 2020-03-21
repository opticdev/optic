import React from 'react'
import {Typography} from '@material-ui/core';
import {DocDivider, DocSubGroupHeadingBigStyles, DocSubGroupHeadingStyles} from './DocConstants';
export function DocSubGroup({title, children, style, innerStyle}) {
  return (
    <div style={{marginTop: 11, ...style}}>
      <div>
      <Typography variant="overline" style={DocSubGroupHeadingStyles}>{title}</Typography>
      <DocDivider />
      </div>
      <div style={innerStyle}>
      {children}
      </div>
    </div>
  )
}

export function DocSubGroupBig({title, children, disabled, style, innerStyle}) {
    return (
        <div style={{marginTop: 11, ...style}}>
            <div style={{maxWidth: 650}}>
                <Typography variant="overline" style={DocSubGroupHeadingBigStyles}>{title}</Typography>
                <DocDivider />
            </div>
            <div style={{maxWidth: 650}} style={innerStyle}>
                {children}
            </div>
        </div>
    )
}
