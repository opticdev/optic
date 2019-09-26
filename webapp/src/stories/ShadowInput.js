import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const shared = {
  padding: 0,
  margin: 0,
  fontSize: 14,
  fontFamily: 'Ubuntu',
  fontWeight: 400,
  backgroundColor: 'transparent'
};

const styles = theme => ({
  input: {
    position: 'absolute',
    outline: 'none',
    border: 'none',
    ...shared
  },
  shadow: {
    position: 'absolute',
    ...shared,
    color: 'grey'
  }
});

class ShadowInput extends React.Component {

  state = {
    userInput: ''
  };

  getMatch = () => {
    const {options = []} = this.props;
    const {userInput} = this.state;
    const match = userInput ? (options.filter(i => i.label.toLowerCase().startsWith(userInput.toLowerCase().trim()))[0]) : null;

    return match
  };

  onChange = (match) => {
    if (this.props.onChange) {
      this.props.onChange(match)
    }
  }

  render() {
    const {classes, className, options = [], onChange} = this.props;
    const {userInput} = this.state;

    const match = this.getMatch()
    const label = (match) ? match.label : null;

    const displayInput = label ? label.substr(0, userInput.length) : userInput;

    return <div className={className}>
      <div className={classes.shadow}>{label}</div>
      <input className={classes.input}
             value={displayInput}
             onKeyDown={(e) => {
               if ( (e.which === 9 || e.which === 13) && match) {
                 this.setState({userInput: label})
                 this.onChange(match)
               }
             }}
             onChange={(e) => this.setState({userInput: e.target.value})}/>
    </div>;
  }
}

export default withStyles(styles)(ShadowInput);
