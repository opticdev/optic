import React from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { LocalCliSpecServiceLoader } from '../components/loaders/ApiLoader';
import { ApiRoutes } from '../routes';
import EventEmitter from 'events';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
import { SpecServiceClient } from '@useoptic/cli-client';
import {
  LocalCliCaptureService,
  LocalCliDiffService,
} from '../services/diff/LocalCliDiffService';

export default function LocalCli(props) {
  const match = useRouteMatch();
  const { apiId } = useParams();

  const eventEmitter = new EventEmitter();
  const specService = new SpecServiceClient(apiId, eventEmitter);

  const captureServiceFactory = async function (specService, captureId) {
    const baseUrl = `/api/specs/${apiId}/captures/${captureId}`;
    return new LocalCliCaptureService(baseUrl);
  };
  const diffServiceFactory = async function (
    specService,
    captureService,
    events,
    rfcState,
    additionalCommands,
    config,
    captureId
  ) {
    const baseUrl = `/api/specs/${apiId}/captures/${captureId}/diffs/${config.diffId}`;
    return new LocalCliDiffService(captureService, baseUrl, config, rfcState);
  };

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <LocalCliSpecServiceLoader
        specService={specService}
        diffServiceFactory={diffServiceFactory}
        captureServiceFactory={captureServiceFactory}
      >
        <ApiRoutes />
      </LocalCliSpecServiceLoader>
    </BaseUrlContext>
  );
}
