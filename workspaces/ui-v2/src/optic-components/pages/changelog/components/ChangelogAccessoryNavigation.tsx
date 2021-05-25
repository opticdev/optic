import React from 'react';
import { ChangesSinceDropdown } from '<src>/optic-components/changelog/ChangelogDropdown';

export function ChangelogPageAccessoryNavigation() {
  return (
    <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'row' }}>
      <ChangesSinceDropdown />
    </div>
  );
}
