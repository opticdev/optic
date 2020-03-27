import React from 'react';
import {LoaderFactory} from './LoaderFactory.js';
import {SpecService} from '../../services/SpecService.js';
import {basePaths} from '../../RouterPaths.js';
import {sharedSpecUploadService} from '../../services/SharedSpecUploadService.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import {ExportUtilities} from '../../utilities/ExportUtilities.js';
import QueueIcon from '@material-ui/icons/Queue';
import IconButton from '@material-ui/core/IconButton';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import {LightTooltip} from '../tooltips/LightTooltip';
import {SpecServiceContext, withSpecServiceContext} from '../../contexts/SpecServiceContext';
import Menu from '@material-ui/core/Menu';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import LinkIcon from '@material-ui/icons/Link';
import copy from 'copy-to-clipboard';
import EventEmitter from 'events';

const basePath = basePaths.sharedBasePath;
const specServiceEvents = new EventEmitter();

class SharedSpecService extends SpecService {
  constructor(id, initialEventsString, exampleRequests) {
    super();
    this.id = id;
    this.eventsString = initialEventsString;
    this.exampleRequests = exampleRequests;
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    this.eventsString = serializedEvents;
    specServiceEvents.emit('events-updated');
    return Promise.resolve();
  }

  saveExample(interaction, requestId) {
    this.exampleRequests[requestId] = this.exampleRequests[requestId] || [];
    this.exampleRequests[requestId].push(interaction);
    return Promise.resolve();
  }

  listExamples(requestId) {
    return Promise.resolve({examples: this.exampleRequests[requestId] || []});
  }

  listCaptures() {
    return Promise.resolve({
      captures: [this.id]
    });
  }

  listCapturedSamples(sessionId) {
    return Promise.resolve({
      'samples': []
    });
  }

  listEvents() {
    return Promise.resolve(this.eventsString);
  }
}

async function specServiceTask(props) {
  const {sharedId} = props.match.params;
  const sharedSpec = await sharedSpecUploadService.load(sharedId);
  const initialEventsString = JSON.stringify(sharedSpec.events);
  const exampleRequests = sharedSpec.exampleRequests;
  const specService = new SharedSpecService(sharedId, initialEventsString, exampleRequests);

  return specService;
}

function ShareButtonBase(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [url, setUrl] = React.useState(null);
  const [oasUrl, setOasURL] = React.useState(null);
  const {specService, cachedQueryResults, rfcId, eventStore} = props;

  async function exportSpec() {
    setIsLoading(true);
    const spec = await ExportUtilities.toSharedSpecRepresentation({
      parentId: specService.id,
      specService,
      rfcId,
      eventStore,
      cachedQueryResults
    });

    const {id} = await sharedSpecUploadService.save(spec);
    debugger
    //@TODO: set base url to whatever.useoptic.com
    setUrl(`https://app.useoptic.com/shared/${id}`);
    setOasURL(`https://apis.useoptic.com/saved/${id}/oas`);
    setIsLoading(false);
  }

  function ShareLink({name, url}) {
    return (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <div>{name}:</div>
      <a href={url} target="_blank" style={{backgroundColor: '#f1f1f1', marginLeft: 7}}>{url}</a>
      <LightTooltip title={'Copy'}>
        <IconButton color="default" size="small" onClick={() => copy(url)} style={{marginLeft: 8}}>
          <LinkIcon/>
        </IconButton>
      </LightTooltip>
    </div>);
  }

  return (
    <>
      <LightTooltip title="Share">
        <IconButton color="primary" size="small" onClick={(e) => {
          exportSpec();
          setAnchorEl(e.currentTarget);
        }}>
          <FileCopyIcon/>
        </IconButton>
      </LightTooltip>
      <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl} style={{marginTop: 30}}>
        <div style={{padding: 12, width: 470, outline: 'none'}}>
          <Typography variant="h6">Share API</Typography>
          <Typography variant="subtitle2" style={{fontWeight: 100}}>These links share an immutable copy of the
            API:</Typography>
          {isLoading && <LinearProgress size="small"/>}
          {!isLoading && url && (
            <>
              <ShareLink name="Optic UI" url={url}/>
              <ShareLink name="OpenAPI" url={oasUrl}/>
            </>
          )}
        </div>
        {/*<DialogActions>*/}
        {/*  {url ? (*/}
        {/*    <Button >Done</Button>*/}
        {/*  ) : (*/}
        {/*    <Button onClick={exportSpec}>Get Share Link</Button>*/}

        {/*  )}*/}
        {/*</DialogActions>*/}
      </Menu>
    </>
  );
}

const ShareButton = withRfcContext(ShareButtonBase);

export const shareButtonComponent = (
  <SpecServiceContext.Consumer>
    {(context) => {
      const {specService} = context;
      return (
        <ShareButton specService={specService}/>
      );
    }}
  </SpecServiceContext.Consumer>
);

const {
  Routes: SharedLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  specServiceEvents,
  shareButtonComponent,
  basePath
});

export default SharedLoaderRoutes;
