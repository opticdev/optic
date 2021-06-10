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
  selectors,
  documentationEditActions,
} from '<src>/store';
import { getEndpointId } from '<src>/utils';

export type DocsFieldOrParameterContributionProps = {
  shapes: IShapeRenderer[];
  id: string;
  name: string;
  depth: number;
  initialValue: string;
  endpoint: {
    method: string;
    pathId: string;
  };
};

export function DocsFieldOrParameterContribution({
  name,
  id,
  shapes,
  depth,
  initialValue,
  endpoint,
}: DocsFieldOrParameterContributionProps) {
  const contributionKey = 'description';
  const endpointId = getEndpointId(endpoint);
  const isEditable = useAppSelector(selectors.isEndpointEditable(endpoint));
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
      isEditing={isEditable}
    />
  );
}

type EndpointNameContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  requiredError?: string;
  initialValue: string;
  endpoint: {
    method: string;
    pathId: string;
  };
};

export function EndpointNameContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
  endpoint,
}: EndpointNameContributionProps) {
  const endpointId = getEndpointId(endpoint);
  const isEditable = useAppSelector(selectors.isEndpointEditable(endpoint));
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
        isEditing={isEditable}
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
  endpoint,
}: EndpointNameContributionProps) {
  const endpointId = getEndpointId(endpoint);
  const isEditable = useAppSelector(selectors.isEndpointEditable(endpoint));
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  return (
    <EditableTextField
      isEditing={isEditable}
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
