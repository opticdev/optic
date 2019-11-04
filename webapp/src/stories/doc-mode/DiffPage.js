import React, {useRef} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Editor from '../../components/navigation/Editor';
import {DiffDocGrid, DocGrid} from './DocGrid';
import {AppBar, Grid, Typography} from '@material-ui/core';
import {DocDarkGrey, DocGrey, methodColors, SubHeadingStyles} from './DocConstants';
import {HeadingContribution} from './DocContribution';
import {DocCodeBox, EndpointOverviewCodeBox, ExampleOnly, ShapeOverview} from './DocCodeBox';
import {DocSubGroup} from './DocSubGroup';
import DiffInfo from './DiffInfo';
import InterpretationCard from './InterpretationCard';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import ReplayIcon from '@material-ui/icons/Replay';
import Button from '@material-ui/core/Button';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import Tooltip from '@material-ui/core/Tooltip';
import ClearIcon from '@material-ui/icons/Clear';
import InterpretationInfo from './InterpretationInfo';
import {HighlightedIDsStore} from './shape/HighlightedIDs';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh'
  },
  specContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    paddingRight: 20,
    paddingBottom: 350,
    overflow: 'scroll'
  },
  requestContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    paddingRight: 20,
    paddingBottom: 350,
    overflow: 'scroll'
  },
  remaining: {
    paddingLeft: 12,
    paddingRight: 12,
    color: DocDarkGrey,
  },
  marginPath: {
    marginTop: theme.spacing(1),
    marginLeft: 2
  },
  button: {
    margin: theme.spacing(1),
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white'
  },
  scroll: {
    overflow: 'scroll',
    paddingBottom: 300,
    paddingTop:  20,
  }
});

const DiffPath = withStyles(styles)(({classes, path, method, url}) => {

  return (

    <DiffDocGrid
      left={(
        <DocSubGroup title="Requested URL">
          <div className={classes.marginPath}>
            <Typography variant="body" component="span" style={{
              fontWeight: 600,
              color: methodColors[method.toUpperCase()]
            }}>{method.toUpperCase()}</Typography>
            <Typography variant="body" component="span" style={{marginLeft: 9, color: DocGrey}}>{url}</Typography>
          </div>
        </DocSubGroup>
      )}
      right={(
        <DocSubGroup title="Path">
          <div className={classes.marginPath}>
            <Typography variant="body" component="span" style={{
              fontWeight: 600,
              color: methodColors[method.toUpperCase()]
            }}>{method.toUpperCase()}</Typography>
            <Typography variant="body" component="span" style={{marginLeft: 9, color: DocGrey}}>{path}</Typography>
          </div>
        </DocSubGroup>
      )}
    />
  );
});

const DiffRequest = withStyles(styles)(({classes, observedRequestBody, shapeId}) => {

  return (
    <DiffDocGrid
      left={(
        <DocSubGroup title="Request Body">
          <DiffInfo color="green"
                    diffText={'##### New Field Observed\n`tags` was observed for the first time in this request.'}/>


          <HighlightedIDsStore>
          <ExampleOnly title="Request" contentType="application/json" example={observedRequestBody}/>
          </HighlightedIDsStore>
        </DocSubGroup>
      )}
      right={(
        <DocSubGroup title="Request Body">
          <InterpretationInfo color="green" diffText={'##### Add New Field\n`tags` will be added to the spec'}/>
          <ShapeOverview title="Shape"/>
        </DocSubGroup>
      )}
    />
  );
});


const DiffResponse = withStyles(styles)(({classes, statusCode, observedBody, shapeId, diff, interpretation}) => {
  return (
    <DiffDocGrid
      left={(
        <DocSubGroup title="200 Response">
          <DiffInfo color="green"
                    diffText={'##### New Field Observed\n`tags` was observed for the first time in this request.'}/>
          <ExampleOnly title="Response Body" contentType="application/json" example={{
            a: true,
            b: false,
            tags: ['aidan', 'dev']
          }}/>
        </DocSubGroup>
      )}
      right={(
        <DocSubGroup title={statusCode + "Response"}>
          <InterpretationInfo color="green" diffText={'##### Add New Field\n`tags` will be added to the spec'}/>
          <ShapeOverview title="Response Body Shape"/>
        </DocSubGroup>
      )}
    />
  );
});

const SpecPanel = withStyles(styles)(({classes}) => {

  return (
    <div className={classes.specContainer}>
      <Typography variant="h4" color="primary">{'Add Pet to User'}</Typography>

      <div>
        <EndpointOverviewCodeBox method={'POST'} url={'/users/:userId/pets'}/>
      </div>

      <DocSubGroup title="Request" style={{marginTop: 22}}>
        <ShapeOverview title="Shape"/>
      </DocSubGroup>

      <DocSubGroup title="200 Response" style={{marginTop: 22}}>
        <ShapeOverview title="Shape"/>
      </DocSubGroup>

    </div>
  );
});

const DiffPanel = withStyles(styles)(({classes}) => {

  return (
    <div className={classes.requestContainer}>

      <Typography variant="h4" color="primary">Observation</Typography>

      <div>
        <EndpointOverviewCodeBox method={'POST'} url={<>
          {'/users/'}<span style={{color: '#dcfcff', fontWeight: 600}}>896gghr212</span>{'/pets'}
        </>}/>
      </div>

      <DocSubGroup title="Request" style={{marginTop: 22}}>
        <DiffInfo color="green"
                  diffText={'##### New Field Observed\n`tags` was observed for the first time in this request.'}/>
        <ExampleOnly title="Body" contentType="application/json" example={{
          a: true,
          b: false,
          tags: ['aidan', 'dev']
        }}/>
      </DocSubGroup>

      <DocSubGroup title="200 Response" style={{marginTop: 22}}>
        <ExampleOnly title="Body" contentType="application/json" example={{
          result: {userId: 'abc', name: 'Aidan'},
          error: null
        }}/>
      </DocSubGroup>

    </div>
  );
});

class DiffPage extends React.Component {

  render() {

    const {classes, url, method, path, observed, expected, remainingInteractions} = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
          <Toolbar variant="dense">
            <div style={{marginRight: 20}}>
              <Tooltip title="End Review">
                <IconButton size="small" aria-label="delete" className={classes.margin} color="primary" disableRipple>
                  <ClearIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            </div>

            <Tooltip title="Replay API Examples">
              <IconButton size="small" aria-label="delete" className={classes.margin} color="primary" disableRipple>
                <FastRewindIcon fontSize="small"/>
              </IconButton>
            </Tooltip>

            <Typography variant="overline" className={classes.remaining}>
              {remainingInteractions} remaining
            </Typography>

            <Tooltip title="Skip Example">
              <IconButton size="small" aria-label="delete" className={classes.margin} color="primary" disableRipple>
                <SkipNextIcon fontSize="small"/>
              </IconButton>
            </Tooltip>

          </Toolbar>
        </AppBar>


        <div className={classes.scroll}>

          <DiffDocGrid left = {<Typography variant="h4" color="primary">Observed</Typography>}
                       right= {<Typography variant="h4" color="primary">Expected</Typography>}/>

          <DiffPath path={path} method={method} url={url}/>

          <DiffRequest observedRequestBody={observed.requestBody} />

          <DiffResponse statusCode={observed.statusCode}  />


        </div>

        {/*<InterpretationCard/>*/}
      </div>
    );
  }
}


DiffPage.propTypes = {
  url: PropTypes.string,
  path: PropTypes.string,
  method: PropTypes.string,

  //observation
  observed: PropTypes.shape({
    statusCode: PropTypes.number,
    requestBody: PropTypes.any,
    responseBody: PropTypes.any,
  }),

  //expected
  expected: PropTypes.shape({
    requestBodyShapeId: PropTypes.any,
    responseBodyShapeId: PropTypes.any,
  }),

  remainingInteractions: PropTypes.number
};

export default withStyles(styles)(DiffPage);
