import React, { FC, useEffect } from 'react';
import {
  shapeActions,
  selectors,
  useAppSelector,
  useAppDispatch,
} from '<src>/store';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { IFieldDetails, IShapeRenderer } from '<src>/types';

import { Loader } from './loaders';

type ShapeFetcherProps = {
  rootShapeId: string;
  changesSinceBatchCommit?: string;
  endpointId: string;
  children: (
    shapes: IShapeRenderer[],
    fieldList: IFieldDetails[]
  ) => React.ReactElement;
};

export const ShapeFetcher: FC<ShapeFetcherProps> = ({
  rootShapeId,
  changesSinceBatchCommit,
  endpointId,
  children,
}) => {
  const spectacle = useSpectacleContext();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      shapeActions.fetchShapes({
        spectacle,
        rootShapeId,
        sinceBatchCommitId: changesSinceBatchCommit,
      })
    );
  }, [dispatch, spectacle, rootShapeId, changesSinceBatchCommit]);
  const shapesState = useAppSelector(selectors.getShapeRenderer(rootShapeId));

  return shapesState.loading ? (
    <Loader title="Loading" />
  ) : shapesState.error ? (
    <div>error</div>
  ) : (
    children(
      shapesState.data,
      selectors.createFlatList(shapesState.data, endpointId)
    )
  );
};
