import React from 'react'

export function Show({when, children, style}) {
  return (
    <div style={{display: !when && 'none', ...style}}>
      {when && children}
    </div>
  )
}

export function ShowSpan({when, children, style}) {
  return (
    <span style={{display: !when && 'none', ...style}}>
      {when && children}
    </span>
  )
}
