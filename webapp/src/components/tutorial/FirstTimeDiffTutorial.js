import React from 'react';
import {DialogContent, DialogTitle, Typography} from '@material-ui/core';
import TutorialBase from './TutorialBase';

function getStepContent(stepIndex, classes) {
  switch (stepIndex) {
    case 0:
      return (
        <>
          <DialogTitle className={classes.title}>Review API Diff</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" className={classes.description}>Optic logs the requests that do not match your current API spec</Typography>
            <div className={classes.center}><img src={'/tutorial/step1.png'} width={850} /></div>
          </DialogContent>
        </>
      );
    case 1:
      return (
        <>
          <DialogTitle className={classes.title}>Approve Changes One-by-one</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" className={classes.description}>Then suggests changes to your spec to make it accurate</Typography>
            <div className={classes.center}><img src={'/tutorial/step2.png'} width={850} /></div>
          </DialogContent>
        </>
      )
    case 2:
      return (
        (
          <>
            <DialogTitle className={classes.title}>Optic Helps write your API Spec</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" className={classes.description}>When you Approve changes, Optic updates the spec for you</Typography>
              <div className={classes.center}><img src={'/tutorial/approvegif.gif'} width={500} /></div>
            </DialogContent>
          </>
        )
      );
    default:
      return '...';
  }
}

const maxSteps = 3;

export default (props) => (
  <TutorialBase {...props}
                tutorialKey={'firstTimeDiff'}
                maxSteps={maxSteps}
                getStepContent={getStepContent}
  />
)
