import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/react';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { IAffordanceTrailsDiffHashMap } from '@useoptic/cli-shared/build/diffs/initial-types';
import {
  IOpticCapturesService,
  IOpticDiffService,
  IUnrecognizedUrl,
} from '@useoptic/spectacle';

import { ParsedDiff } from '<src>/lib/parse-diff';
import { RootState, AppDispatch } from '../root';

export const fetchDiffsForCapture = createAsyncThunk<
  {
    data: {
      diffs: ParsedDiff[];
      urls: IUnrecognizedUrl[];
      trails: IAffordanceTrailsDiffHashMap;
    };
    diffService: IOpticDiffService;
    numberOfEndpoints: number;
  },
  {
    capturesService: IOpticCapturesService;
    captureId: string;
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  'FETCH_DIFFS_FOR_CAPTURE',
  async ({ capturesService, captureId }, thunkApi) => {
    const diffId = uuidv4();

    try {
      const startDiffResult = await capturesService.startDiff(
        diffId,
        captureId
      );
      const diffService = await startDiffResult.onComplete;
      const diffsPromise = diffService.listDiffs();
      const trailsPromise = diffService.learnShapeDiffAffordances();
      const urlsPromise = diffService.listUnrecognizedUrls();
      const [diffs, trails, urls] = await Promise.all([
        diffsPromise,
        trailsPromise,
        urlsPromise,
      ]);

      const parsedDiffs = diffs.diffs.map(
        (i: any) => new ParsedDiff(i[0], i[1], i[2])
      );

      return {
        data: {
          diffs: parsedDiffs,
          urls: urls.urls,
          trails,
        },
        diffService,
        numberOfEndpoints: (
          thunkApi.getState().endpoints.results.data?.endpoints || []
        ).length,
      };
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
      throw e;
    }
  }
);
