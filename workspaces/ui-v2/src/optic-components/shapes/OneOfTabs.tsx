import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { useSharedStyles } from './SharedStyles';
import classNames from 'classnames';
import { useShapeRenderContext } from './ShapeRenderContext';

export type OneOfTabsProps = {
  choices: { label: string; id: string }[];
  parentShapeId: string;
};

export function OneOfTabs(oneOfTabsProps: OneOfTabsProps) {
  const classes = useStyles();
  const { getChoice, updateChoice } = useShapeRenderContext();

  const current = getChoice(oneOfTabsProps);

  return (
    <div className={classes.tabs}>
      {oneOfTabsProps.choices.map((i) => (
        <Choice
          {...i}
          active={current === i.id}
          setActive={() => {
            updateChoice(oneOfTabsProps.parentShapeId, i.id);
          }}
        />
      ))}
    </div>
  );
}

export type ChoiceTabsProps = {
  choices: { label: string; id: string }[];
  value: string;
  setValue: (value: string) => void;
};
export function ChoiceTabs(props: ChoiceTabsProps) {
  const classes = useStyles();
  return (
    <div className={classes.tabs}>
      {props.choices.map((i) => (
        <Choice
          {...i}
          active={props.value === i.id}
          setActive={() => props.setValue(i.id)}
        />
      ))}
    </div>
  );
}

function Choice({
  label,
  id,
  active,
  setActive,
}: {
  label: string;
  id: string;
  active: boolean;
  setActive: () => void;
}) {
  const sharedClasses = useSharedStyles();
  const classes = useStyles();
  return (
    <span
      onClick={setActive}
      className={classNames(sharedClasses.shapeFont, classes.choice, {
        [classes.active]: active,
      })}
    >
      {label}{' '}
    </span>
  );
}

export function ChoiceSwitch({
  label,
  active,
  setActive,
}: {
  label: string;
  active: boolean;
  setActive: () => void;
}) {
  const sharedClasses = useSharedStyles();
  const classes = useStyles();
  return (
    <span
      onClick={setActive}
      className={classNames(sharedClasses.shapeFont, classes.choice, {
        [classes.active]: active,
      })}
    >
      {label}{' '}
    </span>
  );
}

const useStyles = makeStyles((theme) => ({
  tabs: {
    display: 'flex',
  },
  choice: {
    marginRight: 8,
    textTransform: 'none',
    cursor: 'pointer',
    color: '#99a0ae',
    '&:hover': {
      color: '#73819b',
      fontWeight: 700,
    },
  },
  active: {
    fontWeight: 900,
    color: '#73819b',
  },
}));
