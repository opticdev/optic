import React from 'react';

import {SpecService} from '../../../services/SpecService.js';
import {basePaths} from '../../../RouterPaths';
import {LoaderFactory} from '../../loaders/LoaderFactory';
import {notificationAreaComponent, shareButtonComponent} from '../../loaders/SharedLoader';
import {LocalRfcStore} from '../../../contexts/RfcContext';

export const basePath = basePaths.localBasePath;

const specServiceTask = async (props) => {
  console.log({props});
  const specService = new SpecService(props.match.params.specId);
  return Promise.resolve(specService);
};

const {
  Routes: LocalLoaderRoutes
} = LoaderFactory.build({
  RfcStoreImpl: LocalRfcStore,
  specServiceTask,
  notificationAreaComponent,
  shareButtonComponent,
  basePath
});

export default LocalLoaderRoutes;
