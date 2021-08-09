import React, { FC, useState } from 'react';

type HighlightControllerProps = {
  children: (
    selectedItem: string | null,
    setSelectedItem: (selectedItem: string | null) => void
  ) => React.ReactElement;
};

export const HighlightController: FC<HighlightControllerProps> = ({
  children,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  return <>{children(selectedItem, setSelectedItem)}</>;
};
