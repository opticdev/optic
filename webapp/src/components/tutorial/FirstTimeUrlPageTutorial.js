import React from 'react';
import {DialogContent, DialogTitle, Typography} from '@material-ui/core';
import TutorialBase from './TutorialBase';

function getStepContent(stepIndex, classes) {
  switch (stepIndex) {
    case 0:
      return (
        <>
          <DialogTitle className={classes.title}>Document New API Paths</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" className={classes.description}>This page displays all the undocumented paths Optic has observed in your API. <b>Click any path to start documenting it</b></Typography>
            <div className={classes.center}><img src={'/tutorial/urls.png'} width={850} /></div>
          </DialogContent>
        </>
      );
    default:
      return '...';
  }
}

const maxSteps = 1;

export default (props) => (
  <TutorialBase {...props}
                tutorialKey={'firstTimeUrlPage'}
                maxSteps={maxSteps}
                getStepContent={getStepContent}
  />
)
