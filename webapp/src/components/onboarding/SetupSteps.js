import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {NewBehaviorWrapper} from '../navigation/NewBehavior';
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Check from '@material-ui/icons/Check';
import SettingsIcon from '@material-ui/icons/Settings';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import VideoLabelIcon from '@material-ui/icons/VideoLabel';
import {Link} from 'react-router-dom'
import StepConnector from '@material-ui/core/StepConnector';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {primary} from '../../theme';
import Paper from '@material-ui/core/Paper';
import {MarkdownRender} from '../requests/DocContribution';
import {withNavigationContext} from '../../contexts/NavigationContext';

const styles = theme => ({
  paperRoot: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 15
  },
});

const SetupStepsOrder = ({children, classes}) => {

  const renderNoSession = (
    <Paper className={classes.paperRoot}>
      <MarkdownRender source={`
#### Optic has not observed any API traffic yet
Optic is monitoring the behavior of the API running on \`http://localhost:34333\`.
\nHit the API with some traffic!
`}/>
      <div style={{marginTop: 22}}>
        <Button color="secondary" target="_blank" href="https://docs.useoptic.com">Read Documentation</Button>
        <Button color="secondary">Live Chat</Button>
      </div>
    </Paper>
  );


  return (
    <NewBehaviorWrapper renderNoSession={renderNoSession}>
      {({isLoading, session, requestIdsWithDiffs, lastSessionId, baseUrl, unrecognizedUrlCount, cachedQueryResults}) => {
        const runningLocally = process.env.REACT_APP_CLI_MODE === true;
        const hasSamples = session.samples !== 0;

        if (!hasSamples) {
          return renderNoSession
        }

        return children({runningLocally, hasSamples, unrecognizedUrlCount, lastSessionId});

      }}
    </NewBehaviorWrapper>
  );
};

function SetupSteps({classes, baseUrl}) {

  const [activeStep, setActiveStep] = useState(0);


  return (
    <div>
      <SetupStepsOrder classes={classes}>
        {({runningLocally, hasSamples, unrecognizedUrlCount, lastSessionId}) => {

          if (hasSamples) {
            return (
              <Paper className={classes.paperRoot}>
                <MarkdownRender source={`
#### Optic is Setup! Time to document your API
Optic has observed ${unrecognizedUrlCount} undocumented URLs
`}/>
                <div style={{marginTop: 22}}>
                  <Button color="secondary" component={Link} to={`${baseUrl}/diff/${lastSessionId}/urls`}>Start Documenting</Button>
                </div>
              </Paper>
            );
          }

        }}
      </SetupStepsOrder>

    </div>
  );
}

export default withNavigationContext(withStyles(styles)(SetupSteps));
