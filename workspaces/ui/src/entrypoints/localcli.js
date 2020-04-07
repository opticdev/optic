import React from 'react';
import {Route, Switch, useParams} from 'react-router-dom';
import {ApiLocalCLiSpecServiceLoader} from '../components/loaders/ApiLoader';
import {Provider as DebugSessionContextProvider, useMockSession} from '../contexts/MockDataContext';
import {ApiRoutes} from '../routes';
import EventEmitter from "events";
import {SpecService} from '../services/SpecService';
import {Provider as BaseUrlContext } from '../contexts/BaseUrlContext'

export default function LocalCLI(props) {

  const {match} = props;
  const {apiId} = useParams();

  const eventEmitter = new EventEmitter();
  const specService = new SpecService(apiId, eventEmitter)

  return (
    <BaseUrlContext value={{path: match.url}}>
      <ApiLocalCLiSpecServiceLoader specService={specService}>
        <ApiRoutes />
      </ApiLocalCLiSpecServiceLoader>
    </BaseUrlContext>
  );

}
