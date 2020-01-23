import React, {useEffect} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import CssBaseline from '@material-ui/core/CssBaseline';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {TextField} from '@material-ui/core';
import {MarkdownRender} from '../requests/DocContribution';
import {FrameworkLanguageOrder, Frameworks, OtherFramework} from './Frameworks';
import Grid from '@material-ui/core/Grid';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {dracula} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import YamlEditor from '../shared/YamlTextarea';
import {ApiYamlGenerator} from './ApiYamlGenerator';
import {DocDivider} from '../requests/DocConstants';
import {SummaryStatus} from '../dashboards/APIDashboard';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import {VerifiedUser} from '@material-ui/icons';
import {Link} from 'react-router-dom';
import {AddedGreen} from '../shapes/HighlightedIDs';
import {withTrafficSessionContext} from '../../contexts/TrafficSessionContext';
import {withSpecServiceContext} from '../../contexts/SpecServiceContext';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {LinkToDocumentUrls, NewBehaviorSideBar} from '../navigation/NewBehavior';

const useStyles = makeStyles(theme => ({
  content: {
    flexGrow: 1,
    // backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  root: {
    display: 'flex',
    padding: 22
  },
  frameworks: {
    width: 550
  },
  langTitle: {
    fontWeight: 100,
    color: '#aeaeae'
  },
  paper: {
    maxWidth: 750,
    margin: '0 auto'
  },
  bash: {
    backgroundColor: '#44484d',
    color: '#00BA5F',
    paddingLeft: 9,
    paddingRight: 9,

  },
  disabled: {
    opacity: .5,
    pointerEvents: 'none'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left'
  }
}));

export default withNavigationContext(withSpecServiceContext(({specService, baseUrl}) => {
  const classes = useStyles();

  const [skipSetup, setSkipSetup] = React.useState(false);

  const [apiName, setApiName] = React.useState('');
  const [nameFinished, setNameFinished] = React.useState(false);

  const [apiBasePath, setApiBasePath] = React.useState('http://localhost:3000');
  const [apiBasePathFinished, setApiBasePathFinished] = React.useState(false);

  const [framework, setFramework] = React.useState(false);

  const [startCommand, setStartCommand] = React.useState('echo "Replace me with your start command"');
  const [updatedCode, setUpdatedCode] = React.useState(false);
  const [opticYaml, setOpticYaml] = React.useState('');

  useEffect(() => {
    specService.getConfig().then(({config, rawYaml}) => {
      if (!skipSetup && config.name !== 'Unnamed API') {
        setOpticYaml(rawYaml);
        setApiBasePath(config.tasks.start.baseUrl)
        setSkipSetup(true);
      }
    });
  });


  const requiresCommand = () => framework && framework.requireCodeUpdate;

  const triggerRegenerate = () => {

    const yaml = framework && ApiYamlGenerator(apiName,
      requiresCommand() ? startCommand : framework.generateCommand(),
      apiBasePath
    );

    return yaml || '';
  };

  const saveIt = (v) => {
    const value = v || opticYaml || triggerRegenerate();
    setOpticYaml(value);
    specService.putConfig(value);
  };

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <div className={classes.content}>
        {!skipSetup && (
          <>
            <MarkdownRender
              source={`#### Welcome to Optic\nIt's time to add Optic to your API. In just a few minutes Optic will be contract testing, documenting, and monitoring your API.`}
              style={{maxWidth: 620}}/>

            <SetupStep active header={`Name your API`} finished={nameFinished}>
              <ResuableInput placeholder="My API" value={apiName} setValue={setApiName} setFinished={setNameFinished}/>
            </SetupStep>

            <SetupStep active={nameFinished && !apiBasePathFinished}
                       header={`What is the basepath of your API when you develop it locally?`}
                       finished={validURL(apiBasePath) && nameFinished && apiBasePathFinished}>
              <ResuableInput placeholder="Local API Basepath" value={apiBasePath} setValue={setApiBasePath}
                             setFinished={setApiBasePathFinished}/>
            </SetupStep>

            <SetupStep active={nameFinished && apiBasePathFinished} header={`Choose your API Framework`}
                       finished={!!framework}>

              <Grid container className={classes.frameworks}>
                {FrameworkLanguageOrder.map(language => {
                  const frameworksFiltered = Frameworks.filter(i => i.language === language && !i.isOther);
                  return (
                    <Grid item sm={6}>
                      <Typography variant="subtitle1" className={classes.langTitle}>{language}</Typography>
                      {frameworksFiltered.map(i => {
                        return <Button color="primary" onClick={() => {
                          setFramework(i);
                        }}>{i.name}</Button>;
                      })}

                    </Grid>
                  );
                })}

                <Grid sm={12} style={{marginTop: 22}}>
                  <Button color="primary" onClick={() => {
                    setFramework(OtherFramework);
                  }}>{OtherFramework.name}</Button>
                </Grid>
              </Grid>

            </SetupStep>


            {requiresCommand() && <SetupStep active={!!framework && !updatedCode} header={`Provide Start Command`}>

              <MarkdownRender
                source={`Tell Optic how it should start your API when running locally:`}
                style={{maxWidth: 620}}/>

              <ResuableInput bashTheme autoFocus={!startCommand} value={startCommand}
                             setValue={setStartCommand}/>

              <MarkdownRender
                source={`Optic needs to control the port your API listens on locally. Optic adds an environment variable called \`$OPTIC_API_PORT\`. This will be present when you run the API locally with Optic's \`api start\` command.

Make sure your API starts on that port when \`$OPTIC_API_PORT\` is provided:`}
                style={{maxWidth: 620, marginTop: 22}}/>

              <div style={{maxWidth: 620}}>
                <SyntaxHighlighter language="javascript" style={dracula}>
                  {framework.requireCodeUpdate}
                </SyntaxHighlighter>
              </div>

              <FormControlLabel
                value="end"
                control={<Checkbox color="primary" onChange={(e) => {
                  setUpdatedCode(e.currentTarget.checked);
                }}/>}
                label={<span style={{fontWeight: 100}}>I updated my code. Ready to continue.</span>}
                labelPlacement="end"
              />

            </SetupStep>}
          </>
        )}

        {(skipSetup || (framework && (!requiresCommand() || (requiresCommand() && startCommand && updatedCode)))) &&
        <SetupStep style={{marginTop: 22}}
                   header={`Finalize your Optic Integration`}
                   active>

          <DocDivider/>

          <Grid container style={{marginTop: 22}}>
            <Grid item sm={6}>
              <MarkdownRender
                source={`###### Verify Configuration \n- Is this \`command\` the correct one to start API?\n- Is the \`baseUrl\` correct?\n \n\`optic.yml\` *Changes made here are saved to the file system.*`}
                style={{maxWidth: 620}}/>

              <YamlEditor value={opticYaml || triggerRegenerate()} onChange={(value) => {
                saveIt(value);
              }}/>
            </Grid>
            <Grid item sm={6}>
              <MarkdownRender
                source={`###### Test Optic Integration \nFrom now on use Optic's \`api start\` command to start the API so Optic can monitor it locally.`}
                style={{maxWidth: 620}}/>

              <div style={{maxWidth: 620}}>
                <SyntaxHighlighter language="bash" style={dracula}>
                  {`> api start`}
                </SyntaxHighlighter>

                <Status apiBasePath={apiBasePath} baseUrl={baseUrl} specService={specService} saveIt={saveIt}/>

              </div>


            </Grid>

          </Grid>

        </SetupStep>
        }


      </div>
    </div>
  );
}));

class Status extends React.Component {

  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    const {specService, saveIt} = this.props;

    const poll = () => {
      specService.getLastCapture()
        .then(({capture, proxyRunning, serviceRunning, samples}) => {
          this.setState({hasStart: !!capture, capture, proxyRunning, serviceRunning, numberOfSamples: samples});
          setTimeout(poll, 2000);
        });
    };

    saveIt()

    poll();
  }

  state = {
    polling: true,
    capture: null,
    hasStart: true,
    serviceRunning: false,
    proxyRunning: false,
    numberOfSamples: 0
  };

  render() {

    const {apiBasePath, baseUrl} = this.props;
    const {hasStart, serviceRunning, proxyRunning, numberOfSamples, capture} = this.state;

    const showSampling = proxyRunning && serviceRunning;
    const currentSamplesNumber = numberOfSamples / 15 * 100;

    const allSetUp = numberOfSamples > 15;

    return (
      <div>
        {!hasStart && (
          <div>
            <Typography variant="overline">Waiting for you to run `api start`</Typography>
            <LinearProgress/>
          </div>
        )}
        {hasStart && (
          <div style={{display: 'flex', flexDirection: 'row',}}>
            <div style={{paddingLeft: 5}}>
              <SummaryStatus
                on={serviceRunning}
                onText={`Your API is running on \`$OPTIC_API_PORT\` ${capture && capture.taskConfig.serviceConfig.port}`}
                offText={`Waiting for your API to run on \`$OPTIC_API_PORT\` ${capture && capture.taskConfig.serviceConfig.port}`}/>
              <SummaryStatus
                on={proxyRunning}
                onText={`Optic is serving your API on \`${apiBasePath}\``}
                offText={'Optic proxy has not been started not started'}/>

              {showSampling && (
                <div style={{marginTop: 15}}>
                  <MarkdownRender
                    source={`##### Waiting for Samples (${numberOfSamples}/15)\nNice work! Optic appears to be running properly. Hit your API with some traffic to get started!`}/>

                  <LinearProgress variant="determinate" value={currentSamplesNumber > 100 ? 100 : currentSamplesNumber}
                                  style={{marginTop: 12}}/>


                  {allSetUp && (
                    <Paper elevation={2}
                           style={{
                             marginTop: 40,
                             display: 'flex',
                             flexDirection: 'row',
                             alignItems: 'center',
                             justifyContent: 'cetner',
                             padding: 15
                           }}>
                      <VerifiedUserIcon color="primary" style={{color: AddedGreen, height: 60, width: 60}}/>
                      <div style={{paddingLeft: 18}}>
                        <MarkdownRender source={`##### Optic is all set up!`}/>

                        <LinkToDocumentUrls>
                          <Button variant="outlined" color="primary">Start Documenting your
                            API</Button>
                        </LinkToDocumentUrls>
                      </div>
                    </Paper>
                  )}

                </div>
              )}

            </div>
          </div>
        )}
      </div>
    );

  }
}

function SetupStep({active, children, header, finished}) {
  const classes = useStyles();
  return (
    <div className={(!active || finished) && classes.disabled} style={{marginTop: 22}}>
      <MarkdownRender source={`##### ${header}`} style={{maxWidth: 620}}/>
      <div style={{paddingLeft: 9}}>
        {children}
      </div>
    </div>
  );

}

function ResuableInput(props) {
  const {value, setValue, setFinished, bashTheme} = props;
  const classes = useStyles();

  return (
    <div className={classes.inputGroup}>
      <TextField
        inputProps={{
          // className: bashTheme && classes.bash
        }}
        value={value}
        label={props.label}
        placeholder={props.placeholder}
        style={{width: 400}}
        onChange={(e) => setValue(e.target.value)}/>

      {setFinished && <Button disabled={!value} color="secondary" style={{marginLeft: 12, marginTop: 3}}
                              onClick={() => setFinished(true)}>Save</Button>}
    </div>
  );

}


function validURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}
