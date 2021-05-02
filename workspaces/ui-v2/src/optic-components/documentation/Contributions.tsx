import React from 'react';
import { IShapeRenderer } from '../shapes/ShapeRenderInterfaces';
import Helmet from 'react-helmet';
import {
  useContributionEditing,
  useValueWithStagedContributions,
} from '../hooks/edit/Contributions';
import {
  EditableTextField,
  TextFieldVariant,
  FieldOrParameter,
} from '../common';

export type DocsFieldOrParameterContributionProps = {
  shapes: IShapeRenderer[];
  id: string;
  name: string;
  depth: number;
  initialValue: string;
};

export function DocsFieldOrParameterContribution({
  name,
  id,
  shapes,
  depth,
  initialValue,
}: DocsFieldOrParameterContributionProps) {
  const contributionKey = 'description';
  const { isEditing } = useContributionEditing();

  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  return (
    <FieldOrParameter
      name={name}
      shapes={shapes}
      depth={depth}
      value={value}
      setValue={setValue}
      isEditing={isEditing}
    />
  );
}

export type EndpointNameContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  requiredError?: string;
  initialValue: string;
};

export function EndpointNameContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
}: EndpointNameContributionProps) {
  const { isEditing, setEditing } = useContributionEditing();
  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  return (
    <>
      <Helmet>
        <title>{value || 'Unnamed Endpoint'}</title>
      </Helmet>
      <EditableTextField
        isEditing={isEditing}
        setEditing={setEditing}
        value={value}
        setValue={setValue}
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
}: EndpointNameContributionProps) {
  const { isEditing, setEditing } = useContributionEditing();

  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  return (
    <EditableTextField
      isEditing={isEditing}
      setEditing={setEditing}
      value={value}
      setValue={setValue}
      defaultText={defaultText}
      variant={TextFieldVariant.SMALL}
    />
  );
}
