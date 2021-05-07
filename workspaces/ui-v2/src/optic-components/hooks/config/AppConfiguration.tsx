import React, { ReactNode, useContext } from 'react';
import invariant from 'invariant';
interface IFeatureFlags {}

interface IAppConfigurations {
  navigation: {
    showDocs: boolean;
    showChangelog: boolean;
    showDiff: boolean;
  };
  analytics:
    | { enabled: false }
    | {
        enabled: true;
        segmentToken?: string;
        sentryUrl?: string;
        fullStoryOrgId?: string;
      };
  documentation: {
    allowDescriptionEditing: boolean;
  };
}

export type OpticAppConfig = {
  featureFlags: IFeatureFlags;
  config: IAppConfigurations;
};

const AppConfigurationContext = React.createContext<OpticAppConfig | null>(
  null
);

export const AppConfigurationStore = (props: {
  config: OpticAppConfig;
  children: ReactNode;
}) => {
  return (
    <AppConfigurationContext.Provider value={props.config}>
      {props.children}
    </AppConfigurationContext.Provider>
  );
};

export function useFeatureFlags() {
  const value = useContext(AppConfigurationContext);
  invariant(value, 'useFeatureFlags could not find AppConfigurationContext');
  return value!.featureFlags;
}

export function useAppConfig() {
  const value = useContext(AppConfigurationContext);
  invariant(value, 'useFeatureFlags could not find AppConfigurationContext');
  return value!.config;
}
