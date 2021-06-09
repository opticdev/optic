import React, { FC } from 'react';
import { PromptNavigateAway } from '<src>/components';
import { ChangesSinceDropdown } from '<src>/pages/changelog/components/ChangelogDropdown';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { useAppSelector, selectors } from '<src>/store';

import { EditContributionsButton } from './EditContributionsButton';

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
      <PromptNavigateAway shouldPrompt={isEditing && pendingCount > 0} />
      {appConfig.navigation.showChangelog && <ChangesSinceDropdown />}
      {appConfig.documentation.allowDescriptionEditing && (
        <EditContributionsButton />
      )}
    </div>
  );
};
