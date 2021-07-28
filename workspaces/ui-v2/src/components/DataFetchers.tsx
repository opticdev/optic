import React, { FC, useEffect } from 'react';
import { createFlatList } from '<src>/components/FieldOrParameter';
import {
  shapeActions,
  selectors,
  useAppSelector,
  useAppDispatch,
} from '<src>/store';
import { IFieldDetails } from '<src>/components';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { IShapeRenderer } from '<src>/types';

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
    // todo update loading and error states
    <div>loading</div>
  ) : shapesState.error ? (
    <div>error</div>
  ) : (
    children(shapesState.data, createFlatList(shapesState.data, endpointId))
  );
};
