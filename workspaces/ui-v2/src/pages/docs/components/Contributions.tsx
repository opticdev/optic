import React from 'react';
import { IShapeRenderer } from '<src>/types';
import Helmet from 'react-helmet';
import {
  EditableTextField,
  TextFieldVariant,
  FieldOrParameter,
} from '<src>/components';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
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
  required: boolean;
  setSelectedField?: (selectedFieldId: string | null) => void;
};

export function DocsFieldOrParameterContribution({
  name,
  id,
  shapes,
  depth,
  initialValue,
  endpoint,
  required,
  ...props
}: DocsFieldOrParameterContributionProps &
  React.HtmlHTMLAttributes<HTMLInputElement>) {
  const contributionKey = 'description';
  const endpointId = getEndpointId(endpoint);
  const isEditable = useAppSelector(
    selectors.isEndpointFieldEditable({
      ...endpoint,
      fieldId: id,
    })
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
      {...props}
      name={name}
      shapes={shapes}
      depth={depth}
      value={value}
      setValue={(value) => {
        if (value === initialValue) {
          dispatch(
            documentationEditActions.removeContribution({
              id,
              contributionKey,
            })
          );
        } else {
        }
        dispatch(
          documentationEditActions.addContribution({
            id,
            contributionKey,
            value,
            endpointId,
          })
        );
      }}
      isEditing={isEditable}
      required={required}
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
  const appConfig = useAppConfig();

  const isEditable = useAppSelector(selectors.isEndpointEditable(endpoint));
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  if (!appConfig.allowEditing) {
    return (
      <EditableTextField
        isEditing={false}
        setEditing={() => {}}
        value={initialValue || 'Unnamed Endpoint'}
        setValue={() => {}}
        variant={TextFieldVariant.REGULAR}
      />
    );
  }

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
        setValue={(value) => {
          if (value === initialValue) {
            dispatch(
              documentationEditActions.removeContribution({
                id,
                contributionKey,
              })
            );
          } else {
          }
          dispatch(
            documentationEditActions.addContribution({
              id,
              contributionKey,
              value,
              endpointId,
            })
          );
        }}
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
  const appConfig = useAppConfig();
  const isEditable = useAppSelector(selectors.isEndpointEditable(endpoint));
  const contributionValue = useAppSelector(
    (state) =>
      state.documentationEdits.contributions[id]?.[contributionKey]?.value
  );
  const dispatch = useAppDispatch();
  const value =
    contributionValue !== undefined ? contributionValue : initialValue;

  if (!appConfig.allowEditing) {
    return (
      <EditableTextField
        isEditing={false}
        setEditing={() => {}}
        value={initialValue || 'Unnamed Endpoint'}
        setValue={() => {}}
        variant={TextFieldVariant.SMALL}
      />
    );
  }

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
      setValue={(value) => {
        if (value === initialValue) {
          dispatch(
            documentationEditActions.removeContribution({
              id,
              contributionKey,
            })
          );
        } else {
        }
        dispatch(
          documentationEditActions.addContribution({
            id,
            contributionKey,
            value,
            endpointId,
          })
        );
      }}
      defaultText={defaultText}
      variant={TextFieldVariant.SMALL}
    />
  );
}
