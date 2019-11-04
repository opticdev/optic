import React from 'react';
import ListSubheader from '@material-ui/core/ListSubheader';

export function StickyRegion({children}) {
  return (
    <div style={{position: 'sticky', top: 0}}>
      {children}
    </div>
  );
}
