import React, { useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import pathToRegexp from 'path-to-regexp';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import PathMatcher from '../PathMatcher';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Typography from '@material-ui/core/Typography';
import { Show } from '../../shared/Show';
import { DocSubGroup } from '../../docs/DocSubGroup';
import { resolvePath } from '../../utilities/PathUtilities';
import {
  getOrUndefined,
  RequestsCommands,
  RequestsHelper,
  RfcCommands,
  OpticIds,
} from '@useoptic/domain';
import { RfcContext, withRfcContext } from '../../../contexts/RfcContext';
import { pathMethodKeyBuilder, PURPOSE } from '../../../ContributionKeys';
import { PathAndMethod } from './PathAndMethod';
import { useHistory } from 'react-router-dom';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { track } from '../../../Analytics';
import { CaptureContext } from '../../../contexts/CaptureContext';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  urls: {
    maxHeight: 500,
    overflow: 'scroll',
  },
}));

window.OpticIds = OpticIds;

export const NewUrlModal = withRfcContext((props) => {
  const {
    children,
    newUrl,
    urlOverride,
    onClose,
    allUnmatchedPaths,
    onAdd,
  } = props;

  const classes = useStyles();
  const { cachedQueryResults, handleCommands } = useContext(RfcContext);
  const { captureId } = useContext(CaptureContext);
  const knownPathId = getOrUndefined(newUrl.pathId);
  const [naming, setNaming] = React.useState(Boolean(knownPathId));
  const [pathExpression, setPathExpression] = React.useState(newUrl.path);

  const handleClickOpen = () => {
    track('Clicked Undocumented Url', {
      captureId: captureId,
      method: newUrl.method,
      path: newUrl.path,
      knownPathId,
    });
  };

  useEffect(() => {
    if (naming) {
      track("Naming Endpoint", { path: newUrl.path, method: newUrl.method });
    } else {
      track("On Undocumented Url", { path: newUrl.path, method: newUrl.method });
    }
  }, [naming])

  const handleClose = () => {
    track("Closed AddUrlModal")
    setPathExpression(newUrl.path);
    onClose();
  };

  const handleChange = ({ pathExpression }) => {
    setPathExpression(pathExpression);
  };

  const handleCreate = (purpose) => {
    track('Documented New URL', {
      purpose,
      captureId,
      method: newUrl.method,
      pathExpression,
    });

    let lastParentPathId = knownPathId;
    const commands = [];
    //create path if missing
    if (!lastParentPathId) {
      const { pathsById } = cachedQueryResults;
      const pathComponents = pathStringToPathComponents(pathExpression);
      const { toAdd, lastMatch } = resolvePath(pathComponents, pathsById);
      lastParentPathId = lastMatch.pathId;
      toAdd.forEach((addition) => {
        const pathId = OpticIds.newPathId();
        const command = (addition.isParameter
          ? RequestsCommands.AddPathParameter
          : RequestsCommands.AddPathComponent)(
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
      RfcCommands.AddContribution(
        pathMethodKeyBuilder(lastParentPathId, newUrl.method),
        PURPOSE,
        purpose
      )
    );

    //apply commands
    handleCommands(...commands);

    onAdd({
      pathId: lastParentPathId,
      method: newUrl.method,
    });
    onClose();
  };

  const regex = completePathMatcherRegex(
    pathStringToPathComponents(pathExpression)
  );
  const matches = regex.exec(newUrl.path) !== null;
  const matchingUrls = Array.from(
    allUnmatchedPaths.filter((url) => regex.exec(url) && url !== newUrl.path)
  );

  function NamingDialog() {
    const [purpose, setPurpose] = React.useState('');

    return (
      <Dialog
        open={true}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        transitionDuration={0}
        key={'dialog' + newUrl.toString()}
      >
        <form>
          <DialogTitle>Add New Endpoint</DialogTitle>
          <DialogContent style={{ marginTop: -20 }}>
            <PathAndMethod
              method={newUrl.method}
              path={urlOverride || pathExpression}
            />
            <DialogContentText style={{ marginTop: 12 }}>
              What does this endpoint do?
            </DialogContentText>
            <TextField
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreate(purpose);
                }
              }}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNaming(false)}>Back</Button>
            <Button
              type="submit"
              onClick={() => handleCreate(purpose)}
              color="secondary"
              disabled={!matches && !knownPathId && purpose !== ''}
              endIcon={<NavigateNextIcon />}
            >
              Finish
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }

  return (
    <div key={newUrl.toString()}>
      {/*@TODO: investigate this as the cause of broken tabbing */}
      <div onClick={handleClickOpen}>{children}</div>
      {naming ? (
        <NamingDialog key={'naming one' + newUrl.toString()} />
      ) : (
        <Dialog
          open={true}
          onClose={handleClose}
          key={'path to' + newUrl.toString()}
          fullWidth
          maxWidth="md"
          aria-labelledby="form-dialog-title"
        >
          <form>
            <DialogTitle>Add New Endpoint</DialogTitle>
            <DialogContent style={{ marginTop: -20 }}>
              <PathAndMethod method={newUrl.method} path={newUrl.path} />
              <DialogContentText style={{ marginTop: 12 }}>
                Specify the pattern that matches this URL:
              </DialogContentText>

              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 1.5 }}>
                  <PathMatcher
                    initialPathString={newUrl.path}
                    url={newUrl.path}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={classes.urls}>
                <Show when={matchingUrls.length}>
                  <DocSubGroup
                    title="Other matching URLs:"
                    innerStyle={{ paddingLeft: 5 }}
                  >
                    {matchingUrls.map((i) => {
                      return (
                        <Typography
                          variant="subtitle1"
                          style={{ fontSize: 12, marginBottom: 11 }}
                        >
                          {i}
                        </Typography>
                      );
                    })}
                  </DocSubGroup>
                </Show>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                autoFocus={true}
                type="submit"
                onClick={() => setNaming(true)}
                color="secondary"
                disabled={!matches}
                endIcon={<NavigateNextIcon />}
              >
                Next
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </div>
  );
});

function completePathMatcherRegex(pathComponents) {
  const pathString = pathComponentsToString(pathComponents);
  const regex = pathToRegexp(pathString, [], { start: true, end: true });
  return regex;
}

function pathReducer(acc, item) {
  if (
    acc.find(
      (i) =>
        i.method === item.sample.request.method &&
        i.url === item.sample.request.url
    )
  ) {
    return acc;
  } else {
    return acc.concat({
      method: item.sample.request.method,
      url: item.sample.request.url,
      pathId: item.pathId,
      requestId: item.requestId,
      sample: item.sample,
    });
  }
}

export function pathComponentsToString(pathComponents) {
  if (pathComponents.length === 0) {
    return '/';
  }
  const s =
    '/' +
    pathComponents
      .map(({ name, isParameter }) => {
        if (isParameter) {
          const stripped = name
            .replace('{', '')
            .replace('}', '')
            .replace(':', '');
          return `:${stripped}`;
        } else {
          return name;
        }
      })
      .join('/');
  return s;
}

export function cleanupPathComponentName(name) {
  return name.replace(/[{}:]/gi, '');
}

export function trimTrailingEmptyPath(components) {
  if (components.length > 0) {
    if (components[components.length - 1].name === '') {
      return components.slice(0, -1);
    }
  }
  return components;
}

export function pathStringToPathComponents(pathString) {
  const components = pathString.split('/').map((name) => {
    const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{';
    return { name, isParameter };
  });
  const [root, ...rest] = components;
  if (root.name === '') {
    return trimTrailingEmptyPath(rest);
  }
  return trimTrailingEmptyPath(components);
}
