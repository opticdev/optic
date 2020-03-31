import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import pathToRegexp from 'path-to-regexp';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import PathMatcher from '../PathMatcher';
import {cleanupPathComponentName, pathStringToPathComponents} from '../../paths/PathInput';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {pathComponentsToString} from '../../paths/NewUnmatchedUrlWizard';
import Typography from '@material-ui/core/Typography';
import {Show} from '../../shared/Show';
import {DocSubGroup} from '../../requests/DocSubGroup';
import {resolvePath} from '../../utilities/PathUtilities';
import {getOrUndefined, RequestsCommands, RequestsHelper, RfcCommands} from '@useoptic/domain';
import {withRfcContext} from '../../../contexts/RfcContext';
import {pathMethodKeyBuilder, PURPOSE} from '../../../ContributionKeys';
import {withNavigationContext} from '../../../contexts/NavigationContext';
import {PathAndMethod} from './PathAndMethod';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  },
  urls: {
    maxHeight: 500,
    overflow: 'scroll'
  }
}));

export const NewUrlModal = withNavigationContext(withRfcContext(({pushRelative, captureId, children, newUrl, allUnmatchedPaths, cachedQueryResults, handleCommands}) => {
  const classes = useStyles();

  const knownPathId = getOrUndefined(newUrl.pathId);

  const [open, setOpen] = React.useState(false);
  const [naming, setNaming] = React.useState(Boolean(knownPathId));
  const [purpose, setPurpose] = React.useState('');
  const [pathExpression, setPathExpression] = React.useState(newUrl.path);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setPathExpression(newUrl.path);
    setOpen(false);
  };

  const handleChange = ({pathExpression}) => {
    setPathExpression(pathExpression);
  };

  const handleCreate = () => {

    let lastParentPathId = knownPathId
    const commands = [];
    //create path if missing
    if (!lastParentPathId) {
      const {pathsById} = cachedQueryResults;
      const pathComponents = pathStringToPathComponents(pathExpression);
      const {toAdd, lastMatch} = resolvePath(pathComponents, pathsById);
      lastParentPathId = lastMatch.pathId;
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
    }
    //name it
    commands.push(
      RfcCommands.AddContribution(pathMethodKeyBuilder(lastParentPathId, newUrl.method), PURPOSE, purpose),
    )

    //apply commands
    handleCommands(...commands);

    //redirect
    const to = `/diff/${captureId}/paths/${lastParentPathId}/methods/${newUrl.method}`
    pushRelative(to)
  };

  const regex = completePathMatcherRegex(pathStringToPathComponents(pathExpression));
  const matches = regex.exec(newUrl.path) !== null;
  const matchingUrls = Array.from(allUnmatchedPaths.filter((url) => regex.exec(url) && url !== newUrl.path));

  const namingDialog = (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="form-dialog-title">
      <DialogTitle>Add New Endpoint</DialogTitle>
      <DialogContent style={{marginTop: -20}}>
        <PathAndMethod method={newUrl.method} path={pathExpression}/>
        <DialogContentText style={{marginTop: 12}}>
          What does this endpoint do?
        </DialogContentText>
        <TextField value={purpose} onChange={(e) => setPurpose(e.target.value)} autoFocus fullWidth/>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setNaming(false)}>
          Back
        </Button>
        <Button onClick={handleCreate} color="secondary" disabled={!matches}
                endIcon={<NavigateNextIcon/>}>Finish</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <div onClick={handleClickOpen}>
        {children}
      </div>
      {naming ? namingDialog : (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="form-dialog-title">
          <DialogTitle>Add New Endpoint</DialogTitle>
          <DialogContent style={{marginTop: -20}}>
            <PathAndMethod method={newUrl.method} path={newUrl.path}/>
            <DialogContentText style={{marginTop: 12}}>
              Specify the pattern that matches this URL:
            </DialogContentText>

            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{flex: 1.5}}>
                <PathMatcher
                  initialPathString={newUrl.path}
                  url={newUrl.path}
                  autoFocus={true}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={classes.urls}>
              <Show when={matchingUrls.length}>
                <DocSubGroup title="Other matching URLs:" innerStyle={{paddingLeft: 5}}>
                  {matchingUrls.map(i => {
                    return <Typography variant="subtitle1" style={{fontSize: 12, marginBottom: 11}}>{i}</Typography>;
                  })}
                </DocSubGroup>
              </Show>
            </div>


          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => setNaming(true)} color="secondary" disabled={!matches}
                    endIcon={<NavigateNextIcon/>}>Next</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );


}));


function completePathMatcherRegex(pathComponents) {
  const pathString = pathComponentsToString(pathComponents);
  const regex = pathToRegexp(pathString, [], {start: true, end: true});
  return regex;
}
