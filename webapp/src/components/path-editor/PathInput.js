import React from 'react';

import Typography from '@material-ui/core/Typography';

import PathComponent from './PathComponent.js';
import {Keys} from 'react-keydown';
import ShadowInput from '../shape-editor/ShadowInput';

const {BACKSPACE, DELETE, ENTER} = Keys;

/*
This component should
- allow defining a path made up of components which are either basic components or parameterized
- on submit, something should resolve that path against existing paths in projections (caveat: path parameters with different names can cause issues)
- identify which path components need to be added via commands

 */
function newComponent() {
  return {
    name: '',
    isParameter: false
  };
}

export function cleanupPathComponentName(name) {
  return name.replace(/[{}:]/gi, '');
}

export function pathStringToPathComponents(pathString) {
  const components = pathString.split('/')
    .map(name => {
      const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{';
      return {name, isParameter};
    });
  const [root, ...rest] = components;
  if (root.name === '') {
    return rest;
  }
  return components;
}

class PathInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.processValue({pathComponents: [], currentComponent: ''}, this.props.initialPathString);
  }

  componentDidMount() {
    this.emitChange(this.state);
  }

  processValue = (state, value) => {
    const components = pathStringToPathComponents(value);
    const currentComponent = components.length === 0 ? newComponent() : components.pop();

    return {
      pathComponents: [...state.pathComponents, ...components].filter(x => !!x.name),
      currentComponent
    };
  };

  handleChange = (value) => {
    const newState = this.processValue(this.state, value);
    this.setState(newState);
    this.emitChange(newState);
  };

  emitChange = (state) => {
    const {pathComponents, currentComponent} = state;
    const components = currentComponent.name ? [...pathComponents, currentComponent] : pathComponents;

    this.props.onChange(components);
  };

  toggleIsParameter = (i) => () => {
    const {pathComponents} = this.state;
    this.setState({
      pathComponents: pathComponents.map((x, index) => {
        if (index === i) {
          return {
            ...x,
            isParameter: !x.isParameter
          };
        }
        return x;
      })
    });
  };

  handleBackspaceOrEnter = (e) => {
    if (e.which === ENTER) {
      this.props.onSubmit();
      return;
    }
    if (e.which !== DELETE && e.which !== BACKSPACE) {
      return;
    }
    const {currentComponent, pathComponents} = this.state;
    if (currentComponent.name === '') {
      const newState = {
        ...this.state,
        pathComponents: pathComponents.slice(0, -1)
      };
      this.setState(newState);
      this.emitChange(newState);
    }
  };

  render() {
    const {pathComponents, currentComponent} = this.state;
    const {targetUrl} = this.props;

    //Figure out which component to suggest when a target URL is supplied.
    let options = []
    if (targetUrl) {
      const components = targetUrl.split('/').filter(i => !!i)
      const suggestion = components[pathComponents.length]
      options =[{label: suggestion, trueValue: suggestion +'/'}]
    }

    return (
      <div>
        <div style={{display: 'flex'}}>
          <Typography variant="h5">/</Typography>
          {pathComponents.map((x, i) => {
            return (<PathComponent key={i} value={x} onClick={this.toggleIsParameter(i)}/>);
          })}

          <div style={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.87)',
            marginLeft: 9
          }}>
            <ShadowInput
              options={options}
              style={{
                width: 140,
                height: '1.1875em',
                padding: '6px 0 7px',
                // fontSize: 16,
                position: 'relative',
                // fontSize
              }}
              inputStyle={{
                marginTop: 2
              }}
              value={currentComponent.name}
              onKeyDown={this.handleBackspaceOrEnter}
              onChange={() => {
                this.props.onSubmit();
              }}
              onValueChanged={(value => {
                this.handleChange(value);
              })}
            />
          </div>

          {/*<TextField*/}
          {/*  multiline={false}*/}
          {/*  onKeyDown={this.handleBackspaceOrEnter}*/}
          {/*  onChange={(e) => this.handleChange(e.target.value)}*/}
          {/*  value={currentComponent.name}*/}
          {/*  autoFocus*/}
          {/*/>*/}
        </div>
      </div>
    );
  }
}

export default PathInput;
