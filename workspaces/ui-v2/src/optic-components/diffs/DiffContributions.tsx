import React, { FC, useState } from 'react';
import Helmet from 'react-helmet';
import { EditableTextField, TextFieldVariant } from '../common';

type DiffEndpointNameContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
};

export const DiffEndpointNameContribution: FC<DiffEndpointNameContributionProps> = ({
  defaultText,
}) => {
  const [value, setValue] = useState('');

  return (
    <>
      <Helmet>
        <title>{value || 'Unnamed Endpoint'}</title>
      </Helmet>
      <EditableTextField
        isEditing={true}
        setEditing={() => {}}
        value={value}
        setValue={setValue}
        helperText="Help consumers by naming this endpoint"
        defaultText={defaultText}
        variant={TextFieldVariant.REGULAR}
      />
    </>
  );
};

export function DiffEndpointNameMiniContribution({
  id,
  contributionKey,
  defaultText,
}: DiffEndpointNameContributionProps) {
  const [value, setValue] = useState('');

  return (
    <EditableTextField
      isEditing={true}
      setEditing={() => {}}
      value={value}
      setValue={setValue}
      defaultText={defaultText}
      variant={TextFieldVariant.SMALL}
    />
  );
}
