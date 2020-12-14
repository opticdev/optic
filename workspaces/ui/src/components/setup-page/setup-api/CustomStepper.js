import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Typography from '@material-ui/core/Typography';
import { Check } from '@material-ui/icons';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { AddedGreen, SubtleBlueBackground } from '../../../theme';
import StepIcon from '@material-ui/core/StepIcon';
import StepConnector from '@material-ui/core/StepConnector';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: 15,
    backgroundColor: 'transparent',
    flex: 1,
  },
  rootStepper: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  rootIndicator: {
    backgroundColor: '#e2e2e2',
  },
}));

export default function StepperMain({ objective, toc, currentStep }) {
  const classes = useStyles();
  const stepLabelStyles = useStepLabelStyles();

  return (
    <div className={classes.root}>
      <Typography
        variant="subtitle2"
        style={{
          color: 'white',
          marginBottom: 20,
          fontSize: 19,
          fontWeight: 800,
        }}
      >
        {objective}
      </Typography>
      <Stepper
        activeStep={currentStep}
        orientation="vertical"
        connector={<CustomConnector />}
        classes={{ root: classes.rootStepper }}
      >
        {toc.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={CustomIndicator}
              classes={stepLabelStyles}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

const useStepLabelStyles = makeStyles((theme) => ({
  label: {
    color: `${SubtleBlueBackground} !important`,
    opacity: 0.4,
    fontSize: '16px !important',
    fontWeight: '500 !important',
  },
  completed: {
    color: 'white !important',
    opacity: '.6 !important',
    fontWeight: '500 !important',
  },
  active: {
    color: 'white !important',
    opacity: 1,
    fontWeight: '800 !important',
  },
  connectorLine: {
    borderColor: '#50558c',
    marginLeft: -2,
    marginTop: 10,
    marginBottom: 5,
  },
}));

const CustomConnector = (props) => {
  const classes = useStepLabelStyles();

  return (
    <StepConnector
      classes={{
        line: classes.connectorLine,
      }}
      {...props}
    />
  );
};

function CustomIndicator(props) {
  const { active, completed } = props;

  return (
    <div
      style={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: completed ? 2 : 0,
      }}
    >
      <StepIcon
        icon={
          completed ? (
            <Check style={{ color: AddedGreen, fontSize: 20 }} />
          ) : active ? (
            <KeyboardArrowRightIcon
              style={{
                color: SubtleBlueBackground,
                opacity: 0.9,
                fontSize: 20,
              }}
            />
          ) : (
            <RadioButtonUncheckedIcon
              style={{
                color: SubtleBlueBackground,
                opacity: 0.2,
                fontSize: 15,
              }}
            />
          )
        }
      />
    </div>
  );
}
