import React from 'react';
import Button from '@material-ui/core/Button';
import {cleanupPathComponentName, pathStringToPathComponents} from '../../components/path-editor/PathInput';
import pathToRegexp from 'path-to-regexp';
import {RequestsHelper, RequestsCommands} from '../../engine';
import Typography from '@material-ui/core/Typography';
import {withEditorContext} from '../../contexts/EditorContext';
import {withStyles} from '@material-ui/styles';
import {withRfcContext} from '../../contexts/RfcContext';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {resolvePath} from '../../components/requests/NewRequestStepper';
import PathMatcher from '../../components/diff/PathMatcher';
import {AppBar} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/core/SvgIcon/SvgIcon';
import {DiffDocGrid} from './DocGrid';
import {DisplayPath} from './DisplayPath';
import PropTypes from 'prop-types';


function completePathMatcherRegex(pathComponents) {
  const pathString = pathComponentsToString(pathComponents);
  const regex = pathToRegexp(pathString, [], {start: true, end: true});
  return regex;
}

export function pathComponentsToString(pathComponents) {
  if (pathComponents.length === 0) {
    return '/';
  }
  const s = '/' + pathComponents
    .map(({name, isParameter}) => {
      if (isParameter) {
        const stripped = name
          .replace('{', '')
          .replace('}', '')
          .replace(':', '');
        return `:${stripped}`;
      } else {
        return name;
      }
    }).join('/');
  return s;
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh'
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white'
  },
  scroll: {
    overflow: 'scroll',
    paddingBottom: 300,
    paddingTop: 20,
  }
});

class UnmatchedUrlWizard extends React.Component {
  state = {
    pathExpression: '',
    targetUrl: null
  };
  handleChange = ({pathExpression}) => {
    this.setState({
      pathExpression
    });
  };

  selectTarget = (targetUrl) => () => this.setState({targetUrl});

  handleIgnore = () => {
    this.props.onIgnore();
  };
  handleSubmit = () => {
    const {cachedQueryResults} = this.props;
    const {pathsById} = cachedQueryResults;
    const {pathExpression} = this.state;

    const pathComponents = pathStringToPathComponents(pathExpression);
    const {toAdd, lastMatch} = resolvePath(pathComponents, pathsById);
    let lastParentPathId = lastMatch.pathId;
    const commands = [];
    toAdd.forEach((addition) => {
      const pathId = RequestsHelper.newPathId();
      const command = (addition.isParameter ? RequestsCommands.AddPathParameter : RequestsCommands.AddPathComponent)(
        pathId,
        lastParentPathId,
        cleanupPathComponentName(addition.name)
      );
      commands.push(command);
      lastParentPathId = pathId;
    });

    this.props.onSubmit({commands});
  };

  render() {
    const {items, classes} = this.props;
    const {pathExpression, targetUrl} = this.state;
    const regex = completePathMatcherRegex(pathStringToPathComponents(pathExpression));
    const isCompleteMatch = regex.exec(targetUrl);
    // const urls = [...new Set(items.map(x => x.sample.request.url))]
    //              .filter(i => i !== url);

    const urls = ['/users/userA', 'users/userB'];

    const matchingUrls = new Set(urls.filter(url => regex.exec(targetUrl)));

    const nextButton = (
      <Button
        onClick={this.handleSubmit}
        color="primary"
        disabled={!isCompleteMatch}>Add Path</Button>
    );
    const withTooltip = (
      <Tooltip title={'To continue the path you provide must be able to match the observed URL'}>
        <span>{nextButton}</span>
      </Tooltip>
    );


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
          </Toolbar>
        </AppBar>
        <div className={classes.scroll}>

          <DiffDocGrid left={<Typography variant="h4" color="primary">Observed</Typography>}
                       right={(
                         <>
                           <Typography variant="h4" color="primary">Document new Path</Typography>

                           {targetUrl ? (
                             <>
                               <PathMatcher
                                 initialPathString={pathExpression}
                                 url={targetUrl}
                                 onChange={this.handleChange}
                               />

                               <div style={{marginTop: 17, paddingTop: 4, textAlign: 'right'}}>
                                 <Button
                                   onClick={this.handleIgnore}
                                   color="secondary">Skip Path</Button>
                                 {!isCompleteMatch ? withTooltip : nextButton}
                               </div>
                             </>
                           ) : <span>Select a URL</span>}

                           <List>
                             {!targetUrl && (
                               urls.map(i => (
                                 <ListItem button onClick={this.selectTarget(i)}>
                                   <DisplayPath method="GET" url={i}/>
                                 </ListItem>
                               ))
                             )}
                             {urls.filter(i => matchingUrls.has(i)).map(url => {
                               return (
                                 <ListItem><DisplayPath method="GET" url={url}/></ListItem>
                               );
                             })}
                           </List>
                         </>
                       )}/>

        </div>
      </div>
    );
  }
}
//
// UnmatchedUrlWizard.propTypes = {
//   //all the unmatched interactions
//   interactions: PropTypes.array(PropTypes.shape({
//     url: PropTypes.string,
//     method: PropTypes.string,
//     count: PropTypes.number,  //count of all url + method
//     sample: PropTypes.any     //a single sample of the url + method
//   })),
//   //all the unmatched interactions
//   //will include 'purpose' which is a contribution with key 'purpose' for requestId
//   addPath: PropTypes.func,
// };

export default withEditorContext(withRfcContext(withStyles(styles)(UnmatchedUrlWizard)));
