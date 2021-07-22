import React, { FC } from 'react';

import { IFieldDetails } from '<src>/components';

type ContributionsListProps = {
  fieldDetails: IFieldDetails[];
  renderField: (contribution: IFieldDetails) => React.ReactElement;
};

export const ContributionsList: FC<ContributionsListProps> = ({
  fieldDetails,
  renderField,
}) => {
  return <>{fieldDetails.map(renderField)}</>;
};
