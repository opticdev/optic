import React from 'react';
import {DialogContent, DialogTitle, Typography} from '@material-ui/core';
import TutorialBase from './TutorialBase';
import {MarkdownRender} from '../requests/DocContribution';

function getStepContent(stepIndex, classes) {
  switch (stepIndex) {
    case 0:
      return (
        <>
          <DialogTitle className={classes.title}>Provide a Path Matcher</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" className={classes.description}>
              Add a path matcher so Optic can group similar paths to the same operation.
              <ul style={{maxWidth: 580, margin: '0 auto', textAlign: 'left'}}>
                <li>
                  {`Constants in the path should be entered as a normal string`}
                </li>
                <li>
                  {`Path parameters should be wrapped in {curly_braces} or :have_a_colon_in_front`}
                </li>
              </ul>
            </Typography>
            <div className={classes.center}><img src={'/tutorial/adding-path.gif'} width={550} /></div>
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
                tutorialKey={'firstTimePathMatcher'}
                maxSteps={maxSteps}
                getStepContent={getStepContent}
  />
)
