import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Navigation, {ApiDocsSubMenu} from '../navigation/Navbar';
import ApiOverview from '../navigation/ApiOverview';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {DocDivider, DocSubHeading} from '../requests/DocConstants';
import {DocSubGroup} from '../requests/DocSubGroup';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';

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
  }
});

class APIDashboard extends React.Component {
  render() {
    const {classes} = this.props;

    return (
      <div className={classes.root}>

        <Typography variant="h4" color="primary">{'ToDo API'}</Typography>

        <DocDivider style={{marginTop: 6, marginBottom: 30}}/>

        <Grid container>
          <Grid item sm={5}>

            <Grid container>
              <StatCard number={22} label={'Endpoints'} />
              <StatCard number={5} label={'Shapes'} />
              <StatCard number={11} label={'Integrations'} />
            </Grid>

            <Typography variant="h6" color="primary" style={{marginBottom: 12}}>Status</Typography>
            <ApiStatusCard env="Local" status="In Sync. Your API follows its specification"/>
            <ApiStatusCard env="Development" disabled/>
            <ApiStatusCard env="Production" disabled/>


            <Typography variant="h6" color="primary" style={{marginBottom: 12}}>Changelog</Typography>
            <CheckList/>

          </Grid>

          <Grid sm={1}></Grid>

          <Grid item sm={6}>
            <Typography variant="h6" color="primary" style={{marginBottom: 12}}>Checklist</Typography>
            <CheckList/>
          </Grid>

        </Grid>



        <Typography variant="h4" color="primary" style={{marginTop: 70}}>{'Testing'}</Typography>
        <DocDivider style={{marginTop: 6, marginBottom: 30}}/>



      </div>
    );
  }
}

export default withStyles(styles)(APIDashboard);

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


const CheckListItem = withStyles(styles)(({classes, text, checked = false}) => {
  return (
    <ListItem dense button={!checked} style={{height: 37}}>
      <FormControlLabel
        control={<Checkbox color="primary"
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


const CheckList = withStyles(styles)(({classes}) => {
  return (
    <Card elevation={0} className={classes.statusCard}>

      <DocSubGroup title={'Setup + Documentation'} style={{marginTop: -5}}>
        <List dense>
          <CheckListItem text="Download Optic CLI" checked/>
          <CheckListItem text="Add Optic to your API Project" checked/>
          <CheckListItem text="Observe API Traffic"/>
          <CheckListItem text="Document your API"/>
        </List>
      </DocSubGroup>

      {/*<DocSubGroup title={'Integrations'} style={{marginTop: -5}}>*/}
      {/*  <List dense>*/}
      {/*    <CheckListItem text="Document your API Integrations"/>*/}
      {/*    <CheckListItem text="Deploy Integration Monitoring"/>*/}
      {/*  </List>*/}
      {/*</DocSubGroup>*/}

      <DocSubGroup title={'Contract Testing'} style={{marginTop: -5}}>
        <List dense>
          <CheckListItem text="Enable Live API Testing"/>
          <CheckListItem text="Add Optic to CI / CD"/>
        </List>
      </DocSubGroup>

      <DocSubGroup title={'Team Features'} style={{marginTop: -5}}>
        <List dense>
          <CheckListItem text="Install Optic Git Bot"/>
          <CheckListItem text="Setup Slack Notifications"/>
        </List>
      </DocSubGroup>

    </Card>
  );
});
