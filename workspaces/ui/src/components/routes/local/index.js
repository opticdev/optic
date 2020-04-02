import React from 'react';

import {SpecService} from '../../../services/SpecService.js';
import {LoaderFactory} from '../../loaders/LoaderFactory';
import {shareButtonComponent} from '../../loaders/SharedLoader';
import {LocalRfcStore} from '../../../contexts/RfcContext';
import EventEmitter from 'events';

const specServiceEvents = new EventEmitter()
const specServiceTask = async (props) => {
  console.log({props});
  const specService = new SpecService(props.match.params.specId, specServiceEvents);
  return Promise.resolve(specService);
};

const {
  Routes: LocalLoaderRoutes
} = LoaderFactory.build({
  RfcStoreImpl: LocalRfcStore,
  specServiceTask,
  specServiceEvents,
  shareButtonComponent,
});

export default LocalLoaderRoutes;
