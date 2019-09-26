import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import ShadowInput from './ShadowInput';

const styles = theme => ({
  root: {
    padding: 5,
    height: 20,
    maxWidth: 500 //change this to fill the shape picker row
  },
});

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

  ListChoice(),

  // PrimitiveChoice('one of', '$oneOf'),
  // PrimitiveChoice('nullable', '$nullable'),
  // PrimitiveChoice('optional', '$optional'),
  // PrimitiveChoice('identifier', '$identifier'),
  // PrimitiveChoice('reference', '$reference'),
];

class ShapePicker extends React.Component {

  state = {
    steps: [RootChoice()]
  };

  finish = () => {
    const allCommands = this.state.steps.reduce((a, c) => a.concat(c.commands({shapeId: 'shape to change'})), []);
    alert('finished ' + JSON.stringify(allCommands));
  };

  pushChoice = (choice) => {
    this.setState({steps: [...this.state.steps, choice]}, () => {
      if (choice.canFinish()) {
        this.finish();
      }
    });
  };

  render() {
    const {classes} = this.props;
    const {steps} = this.state;

    const renderPreviousSteps = steps.slice(0, steps.length - 1).map(i => <div>last step</div>);
    const currentStep = steps[steps.length - 1];

    const currentComponent = currentStep.component({
      rootInput: (<ShadowInput
        options={options.filter(currentStep.optionsFilter)}
        onChange={(choice) => {
          this.pushChoice(choice);
        }}
      />),
      parameterInput: (paramId) => <ShadowInput
        options={options.filter(currentStep.optionsFilter)}
        onChange={(choice) => {
          alert('set ' + paramId + ' to ' + JSON.stringify(choice));
        }}
      />

    });

    return <Paper className={classes.root}>
      {renderPreviousSteps}
      {currentComponent}
    </Paper>;
  }
}

export default withStyles(styles)(ShapePicker);

function RootChoice() {
  return {
    component: ({label, rootInput}) => <span>{rootInput}</span>,
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
    component: ({label}) => <span>{label}</span>,
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
    component: ({label, parameterInput}) => <span>List of {parameterInput(parameter)}</span>,
    canFinish: (parameters) => false,
    optionsFilter: () => true,
    commands: (parameters) => {
      return [];
    },
  };
}
