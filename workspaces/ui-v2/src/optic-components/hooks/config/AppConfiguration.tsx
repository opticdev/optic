import React, { ReactNode, useContext } from 'react';

interface IFeatureFlags {}

interface IAppConfigurations {
  navigation: {
    showDocs: boolean;
    showChangelog: boolean;
    showDiff: boolean;
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
  return useContext(AppConfigurationContext)!.featureFlags;
}

export function useAppConfig() {
  return useContext(AppConfigurationContext)!.config;
}
