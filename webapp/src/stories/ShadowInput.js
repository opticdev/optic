import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';

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

    return match;
  };

  onChange = (match) => {
    if (this.props.onChange) {
      this.props.onChange(match);
    }
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.value === '') {
      this.setState({userInput: ''})
    }
  }

  render() {
    const {
      classes,
      className,
      options = [],
      onChange,
      onKeyDown,
      onValueChanged,
      style,
      onDelete,
      onEmptyNext,
      inputStyle,
      inputClass
    } = this.props;
    const {userInput} = this.state;

    const match = this.getMatch();
    const label = (match) ? match.label : null;

    const displayInput = label ? label.substr(0, userInput.length) : userInput;

    return <div className={className} style={style}>
      <div className={classes.shadow}>{label}</div>
      <input className={classNames(classes.input, inputClass)}
             value={displayInput}
             autoFocus
             fullWidth
             style={inputStyle}
             onKeyDown={(e) => {
               if (onKeyDown) {
                 onKeyDown(e)
               }

               if (e.keyCode === 8 && e.target.value === '') {
                 if (onDelete) {
                   onDelete();
                 }
               }

               if (e.keyCode === 9) {
                 e.preventDefault()
               }

               const rightArrowAtEnd = (e.target.selectionStart === e.target.value.length && e.which === 39);

               if (e.which === 9 || e.which === 13 || rightArrowAtEnd) {
                 if (match) {
                   const setTo = match.trueValue ? match.trueValue : label
                   this.setState({userInput: setTo});
                   if (onValueChanged) {
                     onValueChanged(setTo)
                   }
                   this.onChange(match);
                 } else {
                   if (onEmptyNext) {
                     onEmptyNext();
                   }
                 }
               }
             }}
             onChange={(e) => {
               const value = e.target.value;
               this.setState({userInput: value});
               if (onValueChanged) {
                 onValueChanged(value)
               }
             }}/>
    </div>;
  }
}

export default withStyles(styles)(ShadowInput);
