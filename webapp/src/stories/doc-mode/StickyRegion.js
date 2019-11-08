import React from 'react';

export function StickyRegion({children}) {
  return (
    <div style={{position: 'sticky', top: 0}}>
      {children}
    </div>
  );
}
