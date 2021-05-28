import React from 'react';
import { ChangesSinceDropdown } from '<src>/pages/changelog/components/ChangelogDropdown';

export function ChangelogPageAccessoryNavigation() {
  return (
    <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'row' }}>
      <ChangesSinceDropdown />
    </div>
  );
}
