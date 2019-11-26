import React from 'react';
import { LoaderFactory } from './LoaderFactory.js';
import NewBehavior from '../navigation/NewBehavior.js';
import { SpecService } from '../../services/SpecService.js'
import { basePaths } from '../../RouterPaths.js';

const basePath = basePaths.interceptorBasePath

class InterceptorSpecService extends SpecService {
  listSessions() {
    return Promise.resolve({
      sessions: ['fakeSessionId']
    })
  }
}

const specService = new InterceptorSpecService

const notificationAreaComponent = <NewBehavior specService={specService} />
const {
  Routes: InterceptorLoaderRoutes
} = LoaderFactory.build({
  specService,
  notificationAreaComponent,
  basePath
})

export default InterceptorLoaderRoutes;