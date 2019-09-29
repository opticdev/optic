import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import ShadowInput from './ShadowInput';
import {Typography} from '@material-ui/core';

const styles = theme => ({
  root: {
    padding: 5,
    height: 18,
    overflow: 'hidden',
    maxWidth: 500, //change this to fill the shape picker row
  },
  horizontalWrapper: {
    display: 'flex',
    flexDirection: 'row'
  },
  inputOuter: {
    position: 'relative',
    top: 0,
    height: 19,
    width: 100
  },
  activeInput: {
    '&:focus': {
      borderBottom: '1px solid #e2e2e2',
    }
  },
  innerScroll: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    paddingRight: 120,
    'scrollbarWidth': 'none',
    '-ms-overflow-style': 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }
});

const textStyle = {
  fontSize: 14,
  marginTop: 1,
  fontWeight: 100,
  fontFamily: 'Ubuntu'
};

// const primitiveOptions = [
//
//   $any: AnyShapeRenderer,
//   $string: PrimitiveShapeRenderer,
//   $number: PrimitiveShapeRenderer,
//   $boolean: PrimitiveShapeRenderer,
//   $oneOf: OneOfShapeRenderer,
//   $nullable: NullableShapeRenderer,
//   $optional: OptionalShapeRenderer,
//   $object: ObjectShapeRenderer,
//   $identifier: IdentifierShapeRenderer,
//   $reference: ReferenceShapeRenderer,
// ]

const options = [
  PrimitiveChoice('anything', '$any'),
  PrimitiveChoice('string', '$string'),
  PrimitiveChoice('number', '$number'),
  PrimitiveChoice('boolean', '$boolean'),
  PrimitiveChoice('object', '$object'),

  //examples
  ConceptChoice('User', 'user_concept'),
  ConceptChoice('EventSummary', 'event_summary_concept'),

  ListChoice(),
  OneOfChoice(),
  OptionalChoice(),
  NullableChoice(),
  IdentifierChoice(),
  ReferenceChoice()
];

const defaultState = {
  steps: [RootChoice()],
  parameters: [],
  markedComplete: []
};

class ShapePicker extends React.Component {

  state = defaultState;

  finish = () => {
    const allCommands = this.state.steps.reduce((a, c) => a.concat(c.commands({shapeId: 'shape to change'})), []);
    alert('finished ' + JSON.stringify(allCommands));
    this.reset();
  };

  reset = () => {
    this.setState({...defaultState, markedComplete: []});
  };

  canFinish = () => {
    if (this.state.steps.length === 1) {
      return false;
    }
    return this.state.steps.every((choice, index) => {
      const params = this.state.parameters[index] || {};
      const markedCompleted = this.state.markedComplete[index];
      const canFinish = choice.canFinish(params, markedCompleted);
      return canFinish;
    });
  };

  pushChoice = (choice, disableRender = false) => {
    this.setState({steps: [...this.state.steps, {...choice, disableRender}]}, () => {
      const canFinish = this.canFinish();
      if (canFinish) {
        this.finish();
      }
    });
    return this.state.steps.length - 1; //return new index
  };

  setParameter = (currentStepIndex, index, parameter, choice) => {

    const params = this.state.parameters[currentStepIndex] || {};
    params[parameter] = {...choice, index: index + 1};

    const replace = [...this.state.parameters];
    replace[currentStepIndex] = params;
    this.setState({parameters: replace});
  };

  //return the last step that can't be finished.
  getCurrentStep = () => {
    if (this.state.steps.length === 1) {
      return 0;
    }
    return findLastIndex(this.state.steps, (choice, index) => {
      const params = this.state.parameters[index] || {};
      return !choice.canFinish(params);
    });
  };

  delete = (isParam) => {
    if (this.state.steps.length > 1) {

      const steps = [...this.state.steps];
      const parameters = [...this.state.parameters];
      const markedComplete = [...this.state.markedComplete];

      if (!isParam) {
        steps.pop();
        parameters.pop();
      }

      if (isParam) {
        steps.pop();
        const currentStepIndex = this.getCurrentStep();
        const sortedKeys = Object.keys((parameters[currentStepIndex]) || {}).sort();
        delete (parameters[currentStepIndex] || {})[sortedKeys[sortedKeys.length - 1]];
        parameters.length = currentStepIndex + 1;
        markedComplete.length = currentStepIndex + 1;
      }

      this.setState({steps, parameters});
    }
  };

  markComplete = (index) => {
    this.state.markedComplete[index] = true;
    this.setState({markedComplete: this.state.markedComplete}, () => {
      const canFinish = this.canFinish();
      if (canFinish) {
        this.finish();
      }
    });
  };

  render() {
    const {classes} = this.props;
    const {steps, parameters} = this.state;

    const currentStepIndex = this.getCurrentStep();
    if (currentStepIndex === -1) {
      return 'all done';
    }
    const renderInactiveChoice = (choice) => {
      if (!choice) {
        return '____';
      }
      const parameters = this.state.parameters[choice.index] || {};
      if (!choice.canFinish(parameters)) {
        return null;
      }
      return choice.component({active: false, parameters, renderInactiveChoice, parameterInput: () => null});
    };
    const renderPreviousSteps = steps.slice(0, currentStepIndex).map((i, index) => {
      if (!i.disableRender) {
        const params = parameters[index] || {};
        return i.component({active: false, parameters: params, parameterInput: () => null, renderInactiveChoice});
      }
    });
    // debugger
    const currentStep = steps[currentStepIndex];
    const currentParameters = parameters[currentStepIndex] || {};

    const currentComponent = currentStep.component({
      active: true,
      parameters: currentParameters,
      renderInactiveChoice,
      rootInput: (<div className={classes.inputOuter}>
        <ShadowInput
          options={options.filter(currentStep.optionsFilter)}
          inputClass={classes.activeInput}
          onDelete={this.delete}
          onChange={(choice) => {
            this.pushChoice(choice);
          }}
        />
      </div>),
      parameterInput: (paramId) => (
        <div className={classes.inputOuter}>
          <ShadowInput
            key={paramId + currentStepIndex}
            style={{marginLeft: 6, marginTop: 1}}
            inputClass={classes.activeInput}
            options={options.filter(currentStep.optionsFilter)}
            onDelete={() => this.delete(paramId)}
            onEmptyNext={() => {
              this.markComplete(currentStepIndex);

            }}
            onChange={(choice) => {
              const newIndex = this.pushChoice(choice, true);
              this.setParameter(currentStepIndex, newIndex, paramId, choice);
            }}
          /></div>)

    });

    return <Paper className={classes.root}>
      <div className={classes.innerScroll}>
        {renderPreviousSteps}
        {currentComponent}
      </div>
    </Paper>;
  }
}

export default withStyles(styles)(ShapePicker);

/*
Styled Components
 */

export function TypeName({name, color}) {
  return <Typography variant="caption" component="div" style={{
    color: color,
    fontWeight: 600,
    fontSize: 14,
    marginTop: -2
  }}>
    {name}
  </Typography>;
}

/*
Choices
 */

function RootChoice() {
  return {
    component: ({label, rootInput, active}) => active ? <span>{rootInput}</span> : null,
    isRoot: true,
    canFinish: (parameters) => true,
    optionsFilter: () => true,
    commands: (parameters) => {
      return [];
    },
  };
}

function PrimitiveChoice(label, id) {
  return {
    label,
    id,
    component: () => {
      return <TypeName name={label} color={'#3682e3'}/>;
    },
    canFinish: (parameters) => true,
    optionsFilter: () => true,
    commands: ({parameters, shapeId}) => {
      return [{change_shape_id: shapeId, to: id}];
    },
  };
}

function ConceptChoice(name, id) {
  return {
    label: name,
    id,
    isNamedShape: true,
    component: () => {
      return <TypeName name={name} color={'#8a558e'}/>;
    },
    canFinish: (parameters) => true,
    optionsFilter: () => true,
    commands: ({parameters, shapeId}) => {
      return [{change_shape_id: shapeId, to: id}];
    },
  };
}

function ListChoice() {
  const parameter = '$listItem';
  return {
    label: 'List',
    id: '$list',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const listItem = parameters[parameter];
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{...textStyle, width: 40 }}>List of</div>
          <div style={{marginLeft: 3}}>{active ? parameterInput(parameter) : renderInactiveChoice(listItem)}</div>
        </div>);
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: ( choice ) => {
      return true
      if (choice.id === '$optional' || choice.id === '$nullable') {
        return false
      }
      return true
    },
    commands: (parameters) => {
      return [];
    },
  };
}

function OptionalChoice() {
  const parameter = '$type';
  return {
    label: 'Optional',
    id: '$optional',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const optionalType = parameters[parameter];

      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Optional </div>
            <div style={{marginLeft: 0}}>{parameterInput(parameter)}</div>
          </div>);
      } else {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{marginLeft: 0}}>{renderInactiveChoice(optionalType)}</div>
            <Typography variant="caption"
                        style={{
                          fontSize: 14,
                          marginTop: -2,
                          marginLeft: 4,
                          fontStyle: 'italic',
                          color: '#828282'
                        }}> (optional)</Typography>
          </div>);
      }
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: () => true,
    commands: (parameters) => {
      return [];
    },
  };
}
function NullableChoice() {
  const parameter = '$type';
  return {
    label: 'Nullable',
    id: '$nullable',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const nullableType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Nullable </div>
            <div style={{marginLeft: 0}}>{parameterInput(parameter)}</div>
          </div>);
      } else {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{marginLeft: 0}}>{renderInactiveChoice(nullableType)}</div>
            <Typography variant="caption"
                        style={{
                          fontSize: 14,
                          marginTop: -2,
                          marginLeft: 4,
                          fontStyle: 'italic',
                          color: '#828282'
                        }}> (nullable)</Typography>
          </div>);
      }
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: () => true,
    commands: (parameters) => {
      return [];
    },
  };
}

function IdentifierChoice() {
  const parameter = '$type';
  return {
    label: 'Identifier',
    id: '$identifier',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const identifierType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Identifier as </div>
            <div style={{marginLeft: 0}}>{parameterInput(parameter)}</div>
          </div>);
      } else {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Identifier as </div>
            <div style={{marginLeft: 0}}>{renderInactiveChoice(identifierType)}</div>
          </div>);
      }
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: (choice) => {
      if (choice.id === '$string' || choice.id === '$number') {
        return true
      }
    },
    commands: (parameters) => {
      return [];
    },
  };
}

function ReferenceChoice() {
  const parameter = '$type';
  return {
    label: 'Reference',
    id: '$reference',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const identifierType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Reference to </div>
            <div style={{marginLeft: 0}}>{parameterInput(parameter)}</div>
          </div>);
      } else {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{marginLeft: 0}}>{renderInactiveChoice(identifierType)}</div>
            <Typography variant="caption"
                        style={{
                          fontSize: 14,
                          marginTop: -2,
                          marginLeft: 4,
                          fontStyle: 'italic',
                          color: '#828282'
                        }}> (reference)</Typography>
          </div>);
      }
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: (choice) => !!choice.isNamedShape,
    commands: (parameters) => {
      return [];
    },
  };
}

function OneOfChoice() {
  return {
    label: 'One of',
    id: '$oneof',
    component: ({label, parameterInput, renderInactiveChoice, active, parameters = {}}) => {
      const currentLength = Object.keys(parameters).length;
      const activeParam = `$param${currentLength}`;

      let selections = null;
      const lastSelections = Object.keys(parameters).sort();
      const offset = lastSelections.length;
      if (active) {
        selections = (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            {lastSelections.map(key => {
              return <div style={{marginLeft: 6, display: 'flex'}}>
                {renderInactiveChoice(parameters[key])}{', '}
              </div>;
            })}
            {parameterInput(activeParam, offset)}
          </div>
        );
      } else {
        selections = (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            {lastSelections.map((key, index) => {
              const only = lastSelections.length === 1;
              const secondToLast = lastSelections.length - 2 === index;
              const last = lastSelections.length - 1 === index;

              const delineator = (() => {
                if (only || last) {
                  return '';
                }

                if (secondToLast) {
                  return <div style={{ minWidth: 21}}>, or </div>;
                }

                return ', ';

              })();

              return <div style={{marginLeft: 6, display: 'flex'}}>
                {renderInactiveChoice(parameters[key])}<div style={{...textStyle, flex: 1}}>{delineator}</div></div>;
            })}
          </div>
        );
      }

      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{...textStyle, width: 47}}>One of</div>
          {selections}
          {/*<div>{active ? parameterInput(parameter) :*/}
          {/*  <div style={{marginLeft: 3}}>{parameters[parameter].label}</div>}</div>*/}
        </div>
      );
    },
    canFinish: (parameters, markedCompleted) => markedCompleted,
    optionsFilter: ( choice ) => {
      return true
      if (choice.id === '$optional' || choice.id === '$nullable') {
        return false
      }
      return true
    },
    commands: (parameters) => {
      return [];
    },
  };
}


function findLastIndex<T>(array, predicate) {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array))
      return l;
  }
  return -1;
}
