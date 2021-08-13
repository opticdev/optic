import React, { useEffect } from 'react';
import { IShapeRenderer } from '<src>/types';
import { useContext, useState, useCallback } from 'react';
import { DepthStore } from './DepthContext';
import { OneOfTabsProps } from './OneOfTabs';

type IShapeRenderContext = {
  selectedFieldId?: string | null;
  showExamples: boolean;
  fieldsAreSelectable: boolean;
  getChoice: (branch: OneOfTabsProps) => string;
  updateChoice: (shapeId: string, branchId: string) => void;
  selectField: (fieldId: string) => void;
};

export const ShapeRenderContext = React.createContext<IShapeRenderContext | null>(
  null
);

type ShapeRenderContextProps = {
  children: React.ReactNode;
  shapes: IShapeRenderer[];
  showExamples: boolean;
  selectedFieldId?: string | null;
  fieldsAreSelectable?: boolean;
  setSelectedField?: (fieldId: string) => void;
};

const getChoicesFromSelectedField = (
  fieldId: string,
  shapes: IShapeRenderer[]
): {
  shapeId: string;
  branchId: string;
}[] => {
  const stack: {
    shapeId: string;
    shapes: IShapeRenderer[];
    choices: {
      shapeId: string;
      branchId: string;
    }[];
  }[] = [
    {
      shapeId: 'root',
      shapes: shapes,
      choices: [],
    },
  ];

  while (stack.length > 0) {
    const { shapeId, shapes, choices } = stack.pop()!;
    const hasMultipleChoices = shapes.length > 1;

    for (const shape of shapes) {
      const newChoices = hasMultipleChoices
        ? [
            ...choices,
            {
              shapeId: shapeId,
              branchId: shape.shapeId,
            },
          ]
        : [...choices];
      if (shape.asObject) {
        for (const field of shape.asObject.fields) {
          if (field.fieldId === fieldId) {
            return newChoices;
          }

          stack.push({
            choices: newChoices,
            shapes: field.shapeChoices,
            shapeId: field.shapeId,
          });
        }
      } else if (shape.asArray) {
        stack.push({
          choices: newChoices,
          shapes: shape.asArray.shapeChoices,
          shapeId: shape.asArray.shapeId,
        });
      }
    }
  }

  return [];
};

export const ShapeRenderStore = ({
  children,
  shapes,
  showExamples,
  selectedFieldId,
  fieldsAreSelectable,
  setSelectedField,
}: ShapeRenderContextProps) => {
  const [selectedOneOfChoices, updateSelectedOneOfChoices] = useState<{
    [key: string]: string;
  }>({});
  useEffect(() => {
    if (selectedFieldId) {
      const choicesForVisibleField = getChoicesFromSelectedField(
        selectedFieldId,
        shapes
      );
      updateSelectedOneOfChoices((previousChoices) => {
        const newChoices = {
          ...previousChoices,
        };
        for (const choice of choicesForVisibleField) {
          newChoices[choice.shapeId] = choice.branchId;
        }
        return newChoices;
      });
    }
  }, [shapes, selectedFieldId]);

  const getChoice = (branch: OneOfTabsProps) => {
    if (selectedOneOfChoices[branch.shapeId]) {
      return selectedOneOfChoices[branch.shapeId];
    } else {
      return branch.choices[0].id;
    }
  };

  const updateChoice = (shapeId: string, branchId: string) => {
    updateSelectedOneOfChoices((previousChoices) => ({
      ...previousChoices,
      [shapeId]: branchId,
    }));
  };

  const selectField = useCallback(
    (fieldId) => {
      if (setSelectedField) setSelectedField(fieldId);
    },
    [setSelectedField]
  );

  return (
    <ShapeRenderContext.Provider
      value={{
        showExamples,
        getChoice,
        updateChoice,
        selectedFieldId,
        selectField,
        fieldsAreSelectable: !!fieldsAreSelectable,
      }}
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
