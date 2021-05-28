import React, { FC } from 'react';
import { PromptNavigateAway } from '<src>/components';
import { ChangesSinceDropdown } from '<src>/pages/changelog/components/ChangelogDropdown';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { useContributionEditing } from '<src>/pages/docs/contexts/Contributions';

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
