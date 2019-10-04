import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import ShadowInput from './ShadowInput';
import {Typography} from '@material-ui/core';
import {commandsToJson, ShapesCommands} from '../../engine';
import sortBy from 'lodash.sortby';

const styles = theme => ({
  root: {
    padding: 5,
    height: 18,
    overflow: 'hidden',
    width: '95%' //change this to fill the shape picker row
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
    height: 32,
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
  fontFamily: 'Ubuntu',
  color: 'black',
  whiteSpace: 'nowrap'
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

const options = (concepts) => [
  PrimitiveChoice('anything', '$any'),
  PrimitiveChoice('string', '$string'),
  PrimitiveChoice('number', '$number'),
  PrimitiveChoice('boolean', '$boolean'),
  PrimitiveChoice('object', '$object'),
  ...(sortBy(concepts, ['label'])),
  ListChoice(),
  OneOfChoice(),
  OptionalChoice(),
  NullableChoice(),
  IdentifierChoice(),
  ReferenceChoice(),
  MapChoice()
];

const defaultState = {
  steps: [RootChoice()],
  parameters: [],
  markedComplete: []
};

class ShapePicker extends React.Component {

  state = defaultState;

  finish = () => {
    let _shapeId = newShapeId();
    const firstShapeId = _shapeId;
    const allCommands = this.state.steps.flatMap((step, index) => {
      const parameters = this.state.parameters[index];
      if (step.isParameter) {
        return [];
      } else {
        const result = step.commands({
          shapeId: _shapeId,
          parameters,
          paramsForChoice: (choice) => this.state.parameters[choice.index]
        });

        console.log(result);
        const [commands, shapeId] = result;
        _shapeId = shapeId;
        return commands;
      }
    });

    if (this.props.onFinish) {
      this.props.onFinish(allCommands, firstShapeId);
    }
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

  pushChoice = (choice, isParameter = false) => {
    this.setState({steps: [...this.state.steps, {...choice, isParameter: isParameter}]}, () => {
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
    const {classes, conceptChoices} = this.props;
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
      if (!i.isParameter) {
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
          options={options(conceptChoices).filter(currentStep.optionsFilter)}
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
            options={options(conceptChoices).filter(currentStep.optionsFilter)}
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

    return <div className={classes.root}>
      <div className={classes.innerScroll}>
        {renderPreviousSteps}
        {currentComponent}
      </div>
    </div>;
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
    height: 19,
    fontSize: 14,
    marginTop: 6
  }}>
    {name}
  </Typography>;
}

function newShapeId() {
  return 'shape_' + Math.random().toString(36).substr(2, 9);
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
    commands: ({shapeId}) => {
      const {AddShape} = ShapesCommands;
      return [
        [AddShape(shapeId, '$any', '')],
        shapeId
      ];
    },
  };
}

function PrimitiveChoice(label, id) {
  return {
    label,
    id,
    isPrimitive: true,
    component: () => {
      return <TypeName name={label} color={'#3682e3'}/>;
    },
    canFinish: (parameters) => true,
    optionsFilter: () => true,
    commands: ({parameters, shapeId}) => {
      return [
        [ShapesCommands.SetBaseShape(shapeId, id)],
        shapeId
      ];
    },
  };
}

export function ConceptChoice(name, id) {
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
      return [
        [ShapesCommands.SetBaseShape(shapeId, id)],
        shapeId
      ];
    },
  };
}

export function GenericConceptChoice(name, id, genericParameters) {
  return {
    label: name,
    id,
    isNamedShape: true,
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      //return <TypeName name={name} color={'#8a558e'}/>;
      let unsetIndex;
      const firstUnset = genericParameters.find((i, index) => {
        if (!parameters[i.id]) {
          unsetIndex = index;
          return true;
        }
      });

      const previous = genericParameters.slice(0, unsetIndex);

      const previousChoices = previous.map(parameter => {
        return (<>
          <div style={{...textStyle, marginLeft: 5}}>{parameter.displayName.split('.')[1]}:</div>
          <div style={{marginLeft: 5}}>{renderInactiveChoice(parameters[parameter.id])}</div>
        </>);
      });

      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <TypeName name={name} color={'#8a558e'}/>
            {previousChoices}
            {firstUnset && (
              <>
                <div style={{...textStyle, marginLeft: 5}}>{firstUnset.displayName.split('.')[1]}:</div>
                <div style={{marginLeft: 5}}>{parameterInput(firstUnset.id)}</div>
              </>
            )}
          </div>);
      } else {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <TypeName name={name} color={'#8a558e'}/>
            {previousChoices}
            {firstUnset && (
              <>
                <div style={{...textStyle, marginLeft: 5}}>{firstUnset.displayName.split('.')[1]}:</div>
              </>
            )}
          </div>);
      }
    },
    canFinish: (parameters) => genericParameters.every(i => !!parameters[i.id]),
    optionsFilter: () => true,
    commands: ({parameters, shapeId, paramsForChoice}) => {

      const {SetBaseShape, SetParameterShape, ProviderInShape, AddShape, ShapeProvider} = ShapesCommands;

      const innerIds = [];

      const innerCommands = genericParameters.flatMap(generic => {
        const param = parameters[generic.id];
        const innerParamId = newShapeId();
        const [commands, shapeId] = param.commands({
          shapeId: innerParamId,
          parameters: paramsForChoice(param),
          paramsForChoice
        });
        innerIds.push([generic.id, shapeId]);
        return [AddShape(shapeId, '$any', ''), ...commands];
      });

      const assignParamsCommands = innerIds.flatMap(([genericId, innerId]) => [
        SetParameterShape(ProviderInShape(shapeId, ShapeProvider(innerId), genericId)),
      ]);
      return [
        [
          ShapesCommands.SetBaseShape(shapeId, id),
          ...innerCommands,
          ...assignParamsCommands
        ],
        shapeId
      ];
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
          <div style={textStyle}>List of</div>
          <div style={{marginLeft: 3}}>{active ? parameterInput(parameter) : renderInactiveChoice(listItem)}</div>
        </div>);
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: (choice) => {
      if (choice.id === '$optional' || choice.id === '$nullable') {
        return false;
      }
      return true;
    },
    commands: ({parameters, shapeId, paramsForChoice}) => {
      return singleParameterType({parameters, shapeId, paramsForChoice}, '$list', parameter);
    },
  };
}

function MapChoice() {
  //hardcoding string as keyValue
  const keyParam = '$mapKey';
  const valueParam = '$mapValue';
  return {
    label: 'Map',
    id: '$map',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const param = parameters[valueParam];
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <span style={{...textStyle, marginRight: 5}}>Map from </span>
          <TypeName name={'string'} color={'#3682e3'}/>
          <span style={{...textStyle, marginLeft: 5}}> to </span>
          <span style={{marginLeft: 3}}>{active ? parameterInput(valueParam) : renderInactiveChoice(valueParam)}</span>
        </div>);
    },
    canFinish: (parameters) => parameters[valueParam],
    optionsFilter: (choice) => true,
    commands: ({parameters, shapeId, paramsForChoice}) => {
      const {SetParameterShape, ProviderInShape, ShapeProvider} = ShapesCommands
      const [commands, id] = singleParameterType({parameters, shapeId, paramsForChoice}, '$map', valueParam);
      const commandsWithKeySet = [...commands, SetParameterShape(ProviderInShape(shapeId, ShapeProvider('$string'), keyParam))]
      return [commandsWithKeySet, id]
    },
  };
}

function OptionalChoice() {
  const parameter = '$optionalInner';
  return {
    label: 'Optional',
    id: '$optional',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const optionalType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Optional</div>
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
    commands: ({parameters, shapeId, paramsForChoice}) => {
      return singleParameterType({parameters, shapeId, paramsForChoice}, '$optional', parameter);
    },
  };
}

function NullableChoice() {
  const parameter = '$nullableInner';
  return {
    label: 'Nullable',
    id: '$nullable',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const nullableType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Nullable</div>
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
    commands: ({parameters, shapeId, paramsForChoice}) => {
      return singleParameterType({parameters, shapeId, paramsForChoice}, '$nullable', parameter);
    },
  };
}

function IdentifierChoice() {
  const parameter = '$identifierInner';
  return {
    label: 'Identifier',
    id: '$identifierInner',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const identifierType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Identifier as</div>
            <div style={{marginLeft: 0}}>{parameterInput(parameter)}</div>
          </div>);
      } else {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Identifier as</div>
            <div style={{marginLeft: 4}}>{renderInactiveChoice(identifierType)}</div>
          </div>);
      }
    },
    canFinish: (parameters) => !!parameters[parameter],
    optionsFilter: (choice) => {
      if (choice.id === '$string' || choice.id === '$number') {
        return true;
      }
    },
    commands: ({parameters, shapeId, paramsForChoice}) => {
      return singleParameterType({parameters, shapeId, paramsForChoice}, '$identifier', parameter);
    },
  };
}

function ReferenceChoice() {
  const parameter = '$referenceInner';
  return {
    label: 'Reference',
    id: '$referenceInner',
    component: ({label, parameterInput, active, parameters = {}, renderInactiveChoice}) => {
      const identifierType = parameters[parameter];
      if (active) {
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={textStyle}>Reference to</div>
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
    commands: ({parameters, shapeId, paramsForChoice}) => {
      return singleParameterType({parameters, shapeId, paramsForChoice}, '$identifier', parameter);
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
                {renderInactiveChoice(parameters[key])}
                <div style={textStyle}>{', '}</div>
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
                  return ', or';
                }

                return ', ';

              })();

              return <div style={{marginLeft: 6, display: 'flex'}}>
                {renderInactiveChoice(parameters[key])}
                <div style={textStyle}>{delineator}</div>
              </div>;
            })}
          </div>
        );
      }

      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={textStyle}>One of</div>
          {selections}
          {/*<div>{active ? parameterInput(parameter) :*/}
          {/*  <div style={{marginLeft: 3}}>{parameters[parameter].label}</div>}</div>*/}
        </div>
      );
    },
    canFinish: (parameters, markedCompleted) => markedCompleted,
    optionsFilter: (choice) => {
      if (choice.id === '$optional' || choice.id === '$nullable') {
        return false;
      }
      return true;
    },
    commands: ({parameters = {}, shapeId, paramsForChoice}) => {
      const {SetBaseShape, SetParameterShape, ProviderInField, ShapeProvider, AddShapeParameter, AddShape, ProviderInShape} = ShapesCommands;
      //@todo fill this out

      const keysSorted = Object.keys(parameters).sort();

      const innerIds = [];

      const innerCommands = keysSorted.flatMap(k => {
        const param = parameters[k];
        const innerParamId = newShapeId();
        const [commands, shapeId] = param.commands({
          shapeId: innerParamId,
          parameters: paramsForChoice(param),
          paramsForChoice
        });
        innerIds.push(shapeId);
        return [AddShape(shapeId, '$any', ''), ...commands];
      });

      const assignParamsCommands = innerIds.flatMap((id, index) => [
        AddShapeParameter('dynamic' + index, shapeId, ''),
        SetParameterShape(ProviderInShape(shapeId, ShapeProvider(id), 'dynamic' + index)),
      ]);

      return [
        [
          ...innerCommands,
          SetBaseShape(shapeId, '$oneOf'),
          ...assignParamsCommands
        ],
        shapeId
      ];
    },
  };
}


/* Helpers */

function findLastIndex<T>(array, predicate) {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array))
      return l;
  }
  return -1;
}

function singleParameterType({parameters, shapeId, paramsForChoice}, id, parameter) {
  const {SetBaseShape, SetParameterShape, ProviderInShape, ShapeProvider, AddShape} = ShapesCommands;
  const ParentInner = parameters[parameter];

  if (ParentInner.isPrimitive || ParentInner.isNamedShape) {
    return [
      [
        SetBaseShape(shapeId, id),
        SetParameterShape(ProviderInShape(shapeId, ShapeProvider(ParentInner.id), parameter))
      ],
      shapeId
    ];
  } else {
    const innerId = newShapeId();
    const ParentInnerCommands = ParentInner.commands({
      shapeId: innerId,
      parameters: paramsForChoice(ParentInner),
      paramsForChoice
    });
    return [
      [
        SetBaseShape(shapeId, id),
        AddShape(innerId, '$any', ''),
        SetParameterShape(ProviderInShape(shapeId, ShapeProvider(innerId), parameter)),
        ...ParentInnerCommands
      ],
      shapeId
    ];
  }
}
