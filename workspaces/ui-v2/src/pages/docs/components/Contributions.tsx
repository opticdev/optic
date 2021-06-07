import React from 'react';
import { IShapeRenderer } from '<src>/components/ShapeRenderer/ShapeRenderInterfaces';
import Helmet from 'react-helmet';
import {
  EditableTextField,
  TextFieldVariant,
  FieldOrParameter,
} from '<src>/components';
import {
  useAppSelector,
  useAppDispatch,
  documentationEditActions,
} from '<src>/store';

export type DocsFieldOrParameterContributionProps = {
  shapes: IShapeRenderer[];
  id: string;
  name: string;
  depth: number;
  initialValue: string;
  endpointId: string;
};

export function DocsFieldOrParameterContribution({
  name,
  id,
  shapes,
  depth,
  initialValue,
  endpointId,
}: DocsFieldOrParameterContributionProps) {
  const contributionKey = 'description';
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;
  const dispatch = useAppDispatch();

  return (
    <FieldOrParameter
      name={name}
      shapes={shapes}
      depth={depth}
      value={value}
      setValue={(value) =>
        dispatch(
          documentationEditActions.addContribution({
            id,
            contributionKey,
            value,
            endpointId,
          })
        )
      }
      isEditing={isEditing}
    />
  );
}

type EndpointNameContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  requiredError?: string;
  initialValue: string;
  endpointId: string;
};

export function EndpointNameContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
  endpointId,
}: EndpointNameContributionProps) {
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  return (
    <>
      <Helmet>
        <title>{value || 'Unnamed Endpoint'}</title>
      </Helmet>
      <EditableTextField
        isEditing={isEditing}
        setEditing={(value) =>
          dispatch(
            documentationEditActions.updateEditState({
              isEditing: value,
            })
          )
        }
        value={value}
        setValue={(value) =>
          dispatch(
            documentationEditActions.addContribution({
              id,
              contributionKey,
              value,
              endpointId,
            })
          )
        }
        helperText="Help consumers by naming this endpoint"
        defaultText={defaultText}
        variant={TextFieldVariant.REGULAR}
      />
    </>
  );
}

export function EndpointNameMiniContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
  endpointId,
}: EndpointNameContributionProps) {
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  return (
    <EditableTextField
      isEditing={isEditing}
      setEditing={(value) =>
        dispatch(
          documentationEditActions.updateEditState({
            isEditing: value,
          })
        )
      }
      value={value}
      setValue={(value) =>
        dispatch(
          documentationEditActions.addContribution({
            id,
            contributionKey,
            value,
            endpointId,
          })
        )
      }
      defaultText={defaultText}
      variant={TextFieldVariant.SMALL}
    />
  );
}
