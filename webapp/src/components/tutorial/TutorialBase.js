import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Dialog, DialogContent, DialogTitle, Typography} from '@material-ui/core';
import compose from 'lodash.compose';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import MobileStepper from '@material-ui/core/MobileStepper';

const styles = theme => ({
  root: {},
  title: {
    textAlign: 'center'
  },
  description: {
    textAlign: 'center',
    color: '#858585',
    marginTop: -15
  },
  center: {
    textAlign: 'center',
  },
});

class TutorialBase extends React.Component {

  state = {
    step: 0
  };

  key = () =>  `tutorial.${this.props.tutorialKey}`;
  shouldShow = () => !localStorage.getItem(this.key());
  markCompleted = () => localStorage.setItem(this.key(), 'true');

  close = () => {
    this.markCompleted();
    this.forceUpdate();
  };

  setActiveStep = (step) => {
    this.setState({step});
  };

  handleNext = () => {
    const {maxSteps} = this.props
    if (this.state.step === maxSteps - 1) {
      this.markCompleted()
      this.forceUpdate()
    } else {
      this.setActiveStep(this.state.step + 1);
    }
  };

  handleBack = () => {
    this.setActiveStep(this.state.step - 1);
  };

  handleReset = () => {
    this.setActiveStep(0);
  };

  render() {
    const firstTime = this.shouldShow();
    const {classes, showWhen, getStepContent, maxSteps} = this.props

    return (
      <Dialog
        maxWidth="md"
        fullWidth
        open={firstTime && showWhen}
        onClose={this.close}
      >

        {getStepContent(this.state.step, classes)}

        <MobileStepper
          steps={maxSteps}
          position="static"
          variant="text"
          activeStep={this.state.step}
          nextButton={
            <Button size="small" autoFocus color="secondary" onClick={this.handleNext}>
              {this.state.step === maxSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          }
          backButton={
            <Button size="small" onClick={this.handleBack} disabled={this.state.step === 0}>
              Back
            </Button>
          }
        />

      </Dialog>
    );
  }
}

export default compose(withStyles(styles))(TutorialBase);
