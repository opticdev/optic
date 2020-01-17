import React from 'react';

import {SpecService} from '../../../services/SpecService.js';
import {routerPaths, basePaths} from '../../../RouterPaths';
import {LoaderFactory} from '../../loaders/LoaderFactory';
import {notificationAreaComponent, shareButtonComponent} from '../../loaders/SharedLoader';

export const basePath = basePaths.localBasePath;
export const basePathIntegrations = basePaths.localIntegrationsPath;

const specServiceTask = async (props) => {
  console.log({props})
  debugger;
  const specService = new SpecService(props.match.params.specId)
  return Promise.resolve(specService)
}

const {
  Routes: LocalLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  notificationAreaComponent,
  shareButtonComponent,
  basePath
});

export default LocalLoaderRoutes;
