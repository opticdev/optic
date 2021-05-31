import * as React from 'react';
import { useContext, useState } from 'react';
import { DepthStore } from './DepthContext';
import { OneOfTabsProps } from './OneOfTabs';

type IShapeRenderContext = {
  showExamples: boolean;
  getChoice: (branch: OneOfTabsProps) => string;
  updateChoice: (parentShapeId: string, branchId: string) => void;
};

export const ShapeRenderContext = React.createContext<IShapeRenderContext | null>(
  null
);

type ShapeRenderContextProps = { children: any; showExamples: boolean };

export const ShapeRenderStore = ({
  children,
  showExamples,
}: ShapeRenderContextProps) => {
  const [selectedOneOfChoices, updateSelectedOneOfChoices]: [
    { [key: string]: string },
    any
  ] = useState({});

  const getChoice = (branch: OneOfTabsProps) => {
    if (selectedOneOfChoices[branch.parentShapeId]) {
      return selectedOneOfChoices[branch.parentShapeId]!;
    } else {
      return branch.choices[0].id;
    }
  };

  const updateChoice = (parentShapeId: string, branchId: string) => {
    updateSelectedOneOfChoices((i: { [key: string]: string }) => ({
      ...i,
      [parentShapeId]: branchId,
    }));
  };

  return (
    <ShapeRenderContext.Provider
      value={{ showExamples, getChoice, updateChoice }}
    >
      <DepthStore depth={0}>{children}</DepthStore>
    </ShapeRenderContext.Provider>
  );
};

export function useShapeRenderContext() {
  const value = useContext(ShapeRenderContext);
  if (!value) {
    throw new Error('Could not find ShapeRendererContext');
  }

  return value;
}
