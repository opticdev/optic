import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import {Box, Container, Typography} from '@material-ui/core';
import {DocDivider} from '../../requests/DocConstants';
import Chip from '@material-ui/core/Chip';
import ReactMinimalPieChart from 'react-minimal-pie-chart';
import {primary, secondary} from '../../../theme';

const styles = theme => ({});

const data = [
  {
    color: primary,
    title: 'Covered',
    value: 70
  },
  {
    color: 'white',
    title: 'Not Covered',
    value: 30
  },
];

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

      <Grid container xs={12} spacing={2} direction='row' alignItems="stretch">
        <Grid item xs={12}>
          <Card>

            <Grid xs={12} container>

              <Grid item xs={4} style={{padding: 20}}>
                <ReactMinimalPieChart
                  cx={25}
                  cy={25}
                  data={data}
                  labelPosition={50}
                  lengthAngle={360}
                  lineWidth={15}
                  paddingAngle={0}
                  radius={25}
                  startAngle={0}
                  viewBoxSize={[
                    65,
                    65
                  ]}
                />
              </Grid>

              <Grid item xs={8} style={{padding: 20}}>
                <Typography variant="h5">API Coverage</Typography>
              </Grid>

            </Grid>

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
