import React from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { LocalCliSpecServiceLoader } from '../components/loaders/ApiLoader';
import { ApiRoutes } from '../routes';
import EventEmitter from 'events';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
import { SpecServiceClient } from '@useoptic/cli-client';

export default function LocalCli(props) {
  const match = useRouteMatch();
  const { apiId } = useParams();

  const eventEmitter = new EventEmitter();
  const specService = new SpecServiceClient(apiId, eventEmitter);

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <LocalCliSpecServiceLoader specService={specService}>
        <ApiRoutes />
      </LocalCliSpecServiceLoader>
    </BaseUrlContext>
  );
}
