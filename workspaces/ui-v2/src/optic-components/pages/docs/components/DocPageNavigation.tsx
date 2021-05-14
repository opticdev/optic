import React, { FC } from 'react';
import { PromptNavigateAway } from '<src>/optic-components/common';
import { ChangesSinceDropdown } from '<src>/optic-components/changelog/ChangelogDropdown';
import { useAppConfig } from '<src>/optic-components/hooks/config/AppConfiguration';
import { useContributionEditing } from '<src>/optic-components/hooks/edit/Contributions';

import { EditContributionsButton } from './EditContributionsButton';

export const DocsPageAccessoryNavigation: FC = () => {
  const appConfig = useAppConfig();
  const { isEditing, pendingCount } = useContributionEditing();

  return (
    <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'row' }}>
      <PromptNavigateAway shouldPrompt={isEditing && pendingCount > 0} />
      {appConfig.navigation.showChangelog && <ChangesSinceDropdown />}
      {appConfig.documentation.allowDescriptionEditing && (
        <EditContributionsButton />
      )}
    </div>
  );
};
