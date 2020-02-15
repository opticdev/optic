import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import {Box, Container, ListItemSecondaryAction, ListItemText, Typography} from '@material-ui/core';
import {DocDivider} from '../../requests/DocConstants';
import Chip from '@material-ui/core/Chip';
import {primary, secondary} from '../../../theme';
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

const styles = theme => ({});

const report = {
  coverage: 76,
};

class TestingDashboard extends React.Component {
  render() {
    const {classes} = this.props;
    return (<div>

      <div style={{padding: 3, marginBottom: 12}}>
        <div style={{padding: 9, paddingLeft: 0, display: 'flex', flexDirection: 'row'}}>
          <Typography variant="overline">Test & Coverage Report</Typography>
          <div style={{flex: 1}}/>
          <div style={{marginTop: 2}}>
            {/*<Chip size="small" color="primary" label={'Follows API Contract'} style={{marginRight: 5}}></Chip>*/}
            <Chip size="small" color="secondary" label={'More traffic required for accurate report'}></Chip>
          </div>
        </div>
        <DocDivider/>
      </div>

      <Grid container xs={12} spacing={2} direction='row' alignItems="stretch">
        <Grid item xs={4}> <StatCard stat={0} description={'contract violations'}/> </Grid>
        <Grid item xs={4}> <StatCard stat={23} description={'requests to undocumented endpoints'}/> </Grid>
        <Grid item xs={4}> <SampleReport samples={122324}/> </Grid>
      </Grid>


      <div style={{padding: 3, marginBottom: 12, marginTop: 20}}>
        <Typography variant="overline">Coverage Report</Typography>
        <DocDivider/>
      </div>

      <Grid container xs={12} spacing={2} direction='row'>
        <Grid item xs={4}>
          <Card style={{padding: 12}}>
            <div style={{display: 'flex'}}>
              <div style={{width: 50}}>
                <CircularProgressbar value={report.coverage} text={`${report.coverage}%`} styles={buildStyles({
                  pathColor: primary,
                  textColor: secondary,
                  trailColor: '#d6d6d6',
                })}/>
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="subtitle2">{report.coverage}% Covered</Typography>
                <Typography variant="subtitle2">{100 - report.coverage}% Uncovered</Typography>
              </div>
            </div>
          </Card>
        </Grid>

        <Grid item xs={8}>
          <Card style={{padding: 12}}>
            <Typography variant="h6">API Endpoints</Typography>
            <List dense>
              <ListItem dense style={{paddingLeft: 0}}>
                <ListItemText primary="GET /users/:userId"/>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>

    </div>);
  }
}

function StatCard({stat, description}) {
  return (
    <Card style={{padding: 12, height: '100%'}}>
      <Typography variant="h4" style={{fontWeight: 100}}>{stat}</Typography>
      <Typography variant="caption">{description}</Typography>
    </Card>
  );
}

function SampleReport({samples, timeSinceStarted}) {
  return (
    <Card style={{padding: 12, height: '100%'}}>
      <Typography variant="subtitle1">Sampling:</Typography>
      <Typography variant="h6" style={{fontWeight: 100}}>{samples} requests</Typography>
      <div>
        <Typography variant="caption" style={{fontWeight: 100}}>since two hours ago</Typography>
      </div>
    </Card>
  );
}

export default withStyles(styles)(TestingDashboard);
