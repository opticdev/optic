import React, { ReactNode, useContext } from 'react';
import invariant from 'invariant';

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
  backendApi: {
    domain?: string;
  };
  sharing:
    | { enabled: false }
    | {
        enabled: true;
        specViewerDomain: string;
      };
}

export type OpticAppConfig = {
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

export function useAppConfig() {
  const value = useContext(AppConfigurationContext);
  invariant(value, 'useAppConfig could not find AppConfigurationContext');
  return value!.config;
}
