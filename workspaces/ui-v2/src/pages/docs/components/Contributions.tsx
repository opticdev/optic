import React from 'react';
import { makeStyles } from '@material-ui/core';
import { IShapeRenderer } from '<src>/types';
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
  required: boolean;
  setSelectedField?: (selectedFieldId: string | null) => void;
};

export function DocFieldContribution(
  props: DocsFieldOrParameterContributionProps
) {
  const { setSelectedField } = props;
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const fieldId = props.id;
  const classes = useStyles();
  const isFieldRemoved = useAppSelector(selectors.isFieldRemoved(fieldId));
  const isFieldRemovedRoot = useAppSelector(
    selectors.isFieldRemovedRoot(props.id)
  );
  const dispatch = useAppDispatch();
  const removeField = () =>
    dispatch(documentationEditActions.removeField({ fieldId }));
  const unremoveField = () =>
    dispatch(documentationEditActions.unremoveField({ fieldId }));

  return process.env.REACT_APP_FF_FIELD_LEVEL_EDITS === 'true' ? (
    <div className={classes.fieldContainer}>
      <div className={classes.contributionContainer}>
        <DocsFieldOrParameterContribution
          {...props}
          onFocus={() => {
            setSelectedField && setSelectedField(fieldId);
          }}
          onBlur={() => {
            setSelectedField && setSelectedField(null);
          }}
        />
      </div>
      {isEditing &&
        (isFieldRemoved ? (
          isFieldRemovedRoot ? (
            <div onClick={unremoveField}>unremove</div>
          ) : (
            <div>is removed</div>
          )
        ) : (
          <div onClick={removeField}>remove</div>
        ))}
    </div>
  ) : (
    <DocsFieldOrParameterContribution {...props} />
  );
}

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

const useStyles = makeStyles((theme) => ({
  fieldContainer: {
    display: 'flex',
  },
  contributionContainer: {
    flexGrow: 1,
  },
}));
