import React from 'react';
import {CardContent, CardHeader, makeStyles, Typography} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import {DocSubGroup} from './DocSubGroup';
import {DocGrid} from './DocGrid';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import {DisplayPath} from './DisplayPath';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import LabelImportantRoundedIcon from '@material-ui/icons/LabelImportantRounded';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
  section: {
    minHeight: 200,
    marginBottom: 110
  }
});

export function NewBehavior({}) {

  const classes = useStyles();


  return (
    <Card elevation={1} className={classes.section}>
      <CardHeader title={
        <>
          <Typography variant="h4" color="secondary">Undocumented Behavior Detected</Typography>
          <Typography variant="body1" style={{marginTop: 5}}>Optic detected some behavior in your API that does not
            match the current
            specification</Typography>
        </>
      }/>
      <CardContent>
        <Grid container>

          <Grid item xs={12} md={6}>

            <DocSubGroup title="Request Diffs">
              <List>
                <ListItem button dense>
                  <ListItemAvatar style={{marginTop: 4}}>
                    <LabelImportantRoundedIcon color="secondary"/>
                  </ListItemAvatar>
                  <ListItemText primary="Create New User" style={{marginLeft: -15}}/>
                </ListItem>
                <ListItem button dense>
                  <ListItemAvatar style={{marginTop: 4}}>
                    <LabelImportantRoundedIcon color="secondary"/>
                  </ListItemAvatar>
                  <ListItemText primary="Update a User's Password" style={{marginLeft: -15}}/>
                </ListItem>

              </List>

            </DocSubGroup>

          </Grid>

          <Grid item xs={12} md={6}>

            <DocSubGroup title="Undocumented URLs">

              <Typography variant="body1" style={{marginTop: 22}}>Optic observed {34} requests to paths that are not in your API specification.</Typography>


              <Button color="secondary" style={{marginTop: 22}} variant="contained">Document an API Request</Button>

            </DocSubGroup>

          </Grid>

        </Grid>
      </CardContent>
    </Card>
  );
}
