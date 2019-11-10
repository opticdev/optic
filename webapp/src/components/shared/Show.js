import React from 'react'

export function Show({when, children}) {
  return (
    <div style={{display: !when && 'none'}}>
      {children}
    </div>
  )
}
