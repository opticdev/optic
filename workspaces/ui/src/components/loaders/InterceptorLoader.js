import React from 'react';
import { LoaderFactory } from './LoaderFactory.js';
import { SpecService } from '../../services/SpecService.js'
import { basePaths } from '../../RouterPaths.js';
import { notificationAreaComponent, shareButtonComponent } from './SharedLoader.js';

const basePath = basePaths.interceptorBasePath

class InterceptorSpecService extends SpecService {
  listCaptures() {
    return Promise.resolve({
      captures: ['interceptor-session-id']
    })
  }
}

const specServiceTask = () => Promise.resolve(new InterceptorSpecService())


const {
  Routes: InterceptorLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  notificationAreaComponent,
  shareButtonComponent,
  basePath
})

export default InterceptorLoaderRoutes;
