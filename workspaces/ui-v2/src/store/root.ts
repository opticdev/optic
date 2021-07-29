import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { reducer as diffReducer } from './diff';
import { reducer as documentationEditReducer } from './documentationEdit';
import { reducer as endpointsReducer } from './endpoints';
import { reducer as metadataReducer } from './metadata';
import { reducer as pathsReducer } from './paths';
import { reducer as shapesReducer } from './shapes';

export const createReduxStore = () =>
  configureStore({
    reducer: {
      endpoints: endpointsReducer,
      documentationEdits: documentationEditReducer,
      metadata: metadataReducer,
      diff: diffReducer,
      paths: pathsReducer,
      shapes: shapesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

export const store = createReduxStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
