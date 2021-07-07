import React, { FC } from 'react';
import { PromptNavigateAway } from '<src>/components';
import { ChangesSinceDropdown } from '<src>/pages/changelog/components/ChangelogDropdown';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { useAppSelector, selectors } from '<src>/store';

import { EditContributionsButton } from './EditContributionsButton';
import { ShareButton } from '<src>/components/sharing/ShareButton';

export const DocsPageAccessoryNavigation: FC = () => {
  const appConfig = useAppConfig();
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const pendingCount = useAppSelector(
    selectors.getDocumentationEditStagedCount
  );

  return (
    <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'row' }}>
      {appConfig.sharing.enabled && <ShareButton />}
      <PromptNavigateAway shouldPrompt={isEditing && pendingCount > 0} />
      <ChangesSinceDropdown />
      {appConfig.features.allowEditing && <EditContributionsButton />}
    </div>
  );
};
