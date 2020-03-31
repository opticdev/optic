import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ApiOverview from '../navigation/ApiOverview';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {DocDarkGrey, DocDivider, DocSubHeading} from '../requests/DocConstants';
import {DocSubGroup} from '../requests/DocSubGroup';
import compose from 'lodash.compose'
import {Link, Redirect} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import {AddedGreenBackground, ChangedYellowBackground, RemovedRed} from '../../contexts/ColorContext';
import {ListItemAvatar, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DescriptionIcon from '@material-ui/icons/Description';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import TimelineIcon from '@material-ui/icons/Timeline';
import ReactMinimalPieChart from 'react-minimal-pie-chart';
import {primary, secondary} from '../../theme';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import classNames from 'classnames';
import {MarkdownRender} from '../requests/DocContribution';
import ListSubheader from '@material-ui/core/ListSubheader';
import {withRfcContext} from '../../contexts/RfcContext';
import {withIntegrationsContext} from '../../contexts/IntegrationsContext';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {withProductDemoContext} from '../navigation/ProductDemo';
import {ProductDemoStoreBase} from '../onboarding/InlineDocs';
import {HasDiffDashboard} from '../navigation/NewBehavior';
import {routerPaths} from '../../RouterPaths';
import {withApiOverviewContext} from '../../contexts/ApiOverviewContext';
import {withSpecServiceContext} from '../../contexts/SpecServiceContext';
import {AddedGreen, ChangedYellow} from '../shapes/ShapeViewer';

const styles = theme => ({
  root: {
    maxWidth: '85%',
    paddingTop: 15,
    margin: '0 auto',
    paddingBottom: 120
  },
  statusCard: {
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    border: '1px solid #e2e2e2',
    display: 'flex',
    flexDirection: 'column'
  },
  env: {
    textTransform: 'uppercase',
    color: '#818181',
    fontSize: 11
  },
  checklistItem: {
    display: 'flex',
    flexDirection: 'row'
  },
  number: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 800
  },
  notification: {
    borderLeft: `5px solid ${ChangedYellow}`,
    backgroundColor: ChangedYellowBackground,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    fontSize: 14,
    marginTop: 13,
    marginBottom: 13,
  },
});

class APIDashboard extends React.Component {
  render() {
    const {classes, baseUrl, demos, apiName, apiOverview} = this.props;
    const setupState = {
      isEmptySpec: apiOverview.isEmptySpec
    }//queries.setupState();

    if (apiOverview.isEmptySpec) {
      return <Redirect to={routerPaths.init(baseUrl)}/>
    }

    return (
      <div className={classes.root}>
        <ProductDemoStoreBase />
        {demos.dashboardDemo}
        <Paper className={classes.statusCard} style={{flexDirection: 'row'}} elevation={0}>
          <Typography variant="h4">{apiName}</Typography>
          <div style={{flex: 1}}/>
         <HasDiffDashboard />
        </Paper>


        <Grid container style={{marginTop: 65}}>
          <Grid item sm={5}>

            <Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'API Overview'}</Typography>
            <APINavLinks text={'Review API Documentation'} subtext={`${apiOverview.operationsToRender.length} Endpoints. ${apiOverview.concepts.length} Shapes`}
                         icon={<DescriptionIcon color="primary" style={{marginLeft: 10}}/>}/>
            <APINavLinks text={'API Testing'} subtext={'Disabled. Click here to Setup'}
                         onClick={() => window.Intercom('showNewMessage', "Hey! Can we join Optic's contract testing beta?")}
                         icon={<TimelineIcon color="primary" style={{marginLeft: 10}}/>}/>



          </Grid>

          <Grid sm={1}></Grid>

          <Grid item sm={6}>
            <Typography variant="h6" color="primary" style={{marginBottom: 12}}>Checklist</Typography>
            <CheckList setupState={setupState} />
          </Grid>

        </Grid>


        {/*<Typography variant="h4" color="primary" style={{marginTop: 70}}>{'Testing'}</Typography>*/}
        {/*<DocDivider style={{marginTop: 6, marginBottom: 30}}/>*/}

        {/*<div className={classNames(classes.notification)}>*/}
        {/*  <MarkdownRender*/}
        {/*    source={`##### Testing Dashboard Disabled\n Optic Live Testing is only enabled in the Optic Pro and Enterprise Subscriptions. The data below is not from your API.`}/>*/}
        {/*  <Button color="primary">Learn More</Button>*/}
        {/*  <Button color="primary">Get Optic Pro</Button>*/}
        {/*</div>*/}

        {/*<TestingDashboard/>*/}

        {/*<Grid container>*/}
        {/*  <Grid item sm={5}>*/}
        {/*    <Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'Environments'}</Typography>*/}

        {/*    <ApiStatusCard env="Development" status="No Issues Detected"/>*/}
        {/*    <ApiStatusCard env="Staging" status="2 Alerts. 8 Warnings"/>*/}
        {/*    <ApiStatusCard env="Production" status="No Issues Detected"/>*/}

        {/*  </Grid>*/}

        {/*  <Grid sm={1}></Grid>*/}
        {/*  <Grid item sm={6}>*/}
        {/*    /!*<Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'Checklist'}</Typography>*!/*/}
        {/*    /!*<TestingChecklist/>*!/*/}
        {/*  </Grid>*/}
        {/*</Grid>*/}
        {/*<IntegrationsDashboard />*/}
      </div>
    );
  }
}

export default withProductDemoContext(withApiOverviewContext(withNavigationContext(withIntegrationsContext(withSpecServiceContext(withRfcContext(withStyles(styles)(APIDashboard)))))));

export const SummaryStatus = withStyles(styles)(({on, onText, offText, classes}) => {
  return (
    <div style={{alignItems: 'center', display: 'flex', marginRight: 14}}>
      {on ? <CheckIcon style={{color: AddedGreen, fontSize: 14}}/> :
        <ClearIcon style={{color: RemovedRed, fontSize: 14}}/>}
      <Typography variant="overline"
                  style={{color: on ? AddedGreen : RemovedRed, marginLeft: 8}}>{on ? onText : offText}</Typography>
    </div>
  );
});

const APINavLinks = withStyles(styles)(({text, subtext, icon, classes, onClick}) => {
  return (
    <ListItem button className={classes.statusCard} style={{flexDirection: 'row'}} elevation={0} onClick={onClick}>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText primary={text} secondary={subtext}/>
    </ListItem>
  );
});


const StatCard = withStyles(styles)(({number, label, classes}) => {
  return (
    <Grid sm={4}>
      <Card elevation={0} className={classes.statusCard} style={{textAlign: 'center'}}>
        <Typography className={classes.number} variant="overline" color="primary">{number}</Typography>
        <Typography variant="overline" style={{marginTop: -10}}>{label}</Typography>
      </Card>
    </Grid>
  );
});


const ApiStatusCard = withStyles(styles)(({classes, env, disabled, status = 'No Data for this Environment'}) => {
  return (
    <Card elevation={0} className={classes.statusCard} style={{
      opacity: disabled ? .6 : 1,
      pointerEvents: disabled ? 'none' : '',
      userSelect: disabled ? 'none' : ''
    }}>
      <Typography variant="caption" color="default" className={classes.env}>Environment: {env}</Typography>
      <Typography variant="subtitle2" color="primary">{status}</Typography>

    </Card>
  );
});


const CheckListItem = withStyles(styles)(({classes, text, checked = false, onClick, disabled}) => {
  return (
    <ListItem dense button={!checked} style={{height: 37}} disabled={disabled}>
      <FormControlLabel
        control={<Checkbox color="primary"
                           onClick={onClick}
                           style={{pointerEvents: 'none', cursor: 'normal'}}
                           disabled={checked}
                           checked={checked}/>}
        label={<>
          <Typography variant="subtitle2" style={{color: checked ? '#858c96' : ''}}>{text}</Typography>
        </>}
      />
    </ListItem>
  );
});


const CheckList = withStyles(styles)(({classes, setupState}) => {
  return (
    <Card elevation={0} className={classes.statusCard}>
      <CheckListItem text="Add Optic to your API" checked={!setupState.isEmptySpec}/>
      <CheckListItem text="Setup Automated Contract Testing" onClick={() => window.Intercom('showNewMessage', "Hey! Can we join Optic's contract testing beta?")} checked={false}/>
    </Card>
  );
});

const TestingChecklist = withStyles(styles)(({classes}) => {
  return (
    <Card elevation={0} className={classes.statusCard}>
      <DocSubGroup title={'Setup Live Testing'} style={{marginTop: -5}}>
        <List dense>
          <CheckListItem text="Sign-up for Optic Pro"/>
          <CheckListItem disabled text="Add Optic Monitoring to your Infrastructure"/>
        </List>
      </DocSubGroup>
    </Card>
  );
});

const IntegrationsChecklist = withStyles(styles)(({classes}) => {
  return (
    <Card elevation={0} className={classes.statusCard}>
      <DocSubGroup title={'Optic Integration Monitoring'} style={{marginTop: -5}}>
        <List dense>
          <CheckListItem text="Setup Integrations Documentation"/>
          <CheckListItem text="Add Integration Monitoring to your Infrastructure"/>
        </List>
      </DocSubGroup>
    </Card>
  );
});

export const IntegrationsDashboard = compose(withNavigationContext, withStyles(styles))(({classes, className, baseUrl}) => {

  const integrations = [
    {name: "Delta Flight Search", host: "https://booking.delta.com"},
    {name: "Google Calendar", host: "https://api.calendar.google.com"}
  ]

  return (
    <div className={classes[className]}>
      <Typography variant="h4" color="primary" style={{marginTop: 70}}>{'Integrations'}</Typography>

      <DocDivider style={{marginTop: 6, marginBottom: 30}}/>

      <div className={classNames(classes.notification)}>
        <MarkdownRender source={`##### 2/2 Integrations Tracked \n For unlimited integrations, sign up for Optic Pro or Enterprise Subscriptions.`}/>
        <Button color="primary">Learn More</Button>
        <Button color="primary">Get Optic Pro</Button>
      </div>

      <Grid container>
        <Grid item sm={5}>
          <Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'Providers'}</Typography>

          <Paper className={classes.statusCard} style={{height: 430, overflow:'scroll', padding: 0}} elevation={0}>
            <List subheader={<ListSubheader style={{backgroundColor: 'white'}}>{`${integrations.length} Documented Providers`}</ListSubheader>}>
              {integrations.map(i => (
                <ListItem button component={Link}>
                  <ListItemText primary={i.name} secondary={i.host}/>
                  <ListItemSecondaryAction>
                    <Typography variant="overline">12 Endpoints</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>

        </Grid>

        <Grid sm={1}></Grid>
        <Grid item sm={6}>

          <Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'Integration Health'}</Typography>
          <Paper className={classes.statusCard} style={{ overflow:'scroll', padding: 0}} elevation={0}>

            <Typography variant="h2" style={{textAlign: 'center', color: AddedGreen, fontWeight: 800}}>A-</Typography>
            <Typography variant="overline" style={{textAlign: 'center', color: DocDarkGrey}}>1-2 Breaking Changes a Month</Typography>
            <DocDivider />
            <div className={classNames(classes.notification)} style={{margin: 8}}>
              <MarkdownRender source={`##### Advanced Integration Health \n Available in Optic Pro or Enterprise Subscriptions.`}/>
              <Button color="primary">Learn More</Button>
              <Button color="primary">Get Optic Pro</Button>
            </div>
          </Paper>

          <Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'Checklist'}</Typography>
          <IntegrationsChecklist />
        </Grid>
      </Grid>
    </div>
    )
});

const TestingDashboard = withStyles(styles)(({classes}) => {

  const data = [
    {
      color: primary,
      title: 'Optic Live Testing',
      value: 120
    },
    {
      color: secondary,
      title: 'Code Tests',
      value: 32
    },
    {
      color: '#e37d00',
      title: 'Manual Testing',
      value: 10
    },
    {
      color: '#c4c4c4',
      title: 'Untested',
      value: 6
    }
  ];

  const total = data.map(i => i.value).reduce((a, b) => a + b, 0);

  return (
    <>
      <Typography variant="h6" color="primary" style={{marginBottom: 12}}>{'Coverage'}</Typography>
      <Paper className={classes.statusCard} style={{flexDirection: 'row'}} elevation={0}>

        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', flex: 1}}>
          <Typography variant="h2">
            <span style={{color: AddedGreen, fontWeight: 800}}>98%</span>
            <TrendingUpIcon style={{color: AddedGreen, fontSize: 40}}/>
          </Typography>
          <Typography variant="h5">API Test Coverage</Typography>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', padding: 12}}>
          <ReactMinimalPieChart
            cx={50}
            cy={50}
            data={data}
            labelPosition={50}
            lengthAngle={360}
            lineWidth={15}
            paddingAngle={0}
            radius={50}
            startAngle={0}
            viewBoxSize={[
              65,
              65
            ]}
          />

          <List style={{marginLeft: 20}}>
            {data.map(i => (
              <ListItem>
                <div style={{backgroundColor: i.color, width: 10, height: 10, marginRight: 10}}/>
                <ListItemText primary={i.title} secondary={`${(i.value / total * 100).toFixed(0)}%`}/>
              </ListItem>
            ))}
          </List>
        </div>

      </Paper>
    </>
  );
});
