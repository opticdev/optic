import React from 'react'

export function Show({when, children, style}) {
  return (
    <div style={{display: !when && 'none', ...style}}>
      {when && children}
    </div>
  )
}
