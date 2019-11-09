import React from 'react';

export function StickyRegion({ children, ...rest }) {
  return (
    <div style={{ position: 'sticky', top: 0 }} {...rest}>
      {children}
    </div>
  );
}
