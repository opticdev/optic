import React from 'react';
import { LoaderFactory, SpecServiceContext } from './LoaderFactory.js';
import NewBehavior from '../navigation/NewBehavior.js';
import { SpecService } from '../../services/SpecService.js'
import { basePaths } from '../../RouterPaths.js';
import { sharedSpecUploadService } from '../../services/SharedSpecUploadService.js';
import { withRfcContext } from '../../contexts/RfcContext.js';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { ExportUtilities } from '../../utilities/ExportUtilities.js';

const basePath = basePaths.sharedBasePath

class SharedSpecService extends SpecService {
  constructor(id, initialEventsString, exampleRequests) {
    super()
    this.id = id;
    this.eventsString = initialEventsString
    this.exampleRequests = exampleRequests
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    this.eventsString = serializedEvents
    return Promise.resolve()
  }

  saveExample(interaction, requestId) {
    this.exampleRequests[requestId] = this.exampleRequests[requestId] || [];
    this.exampleRequests[requestId].push(interaction)
    return Promise.resolve()
  }

  listExamples(requestId) {
    return Promise.resolve({ examples: this.exampleRequests[requestId] || [] })
  }

  listSessions() {
    return Promise.resolve({
      sessions: [this.id]
    })
  }

  loadSession(sessionId) {
    return Promise.resolve({
      sessionResponse: {
        "session": {
          "samples": [
            
          ]
        }
      }
    })
  }

  listEvents() {
    return Promise.resolve(this.eventsString)
  }
}

async function specServiceTask(props) {
  const { sharedId } = props.match.params
  const sharedSpec = await sharedSpecUploadService.load(sharedId)
  const initialEventsString = JSON.stringify(sharedSpec.events)
  const exampleRequests = sharedSpec.exampleRequests
  const specService = new SharedSpecService(sharedId, initialEventsString, exampleRequests)

  return specService
}
function ShareButtonBase(props) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [url, setUrl] = React.useState(null)
  const { specService, cachedQueryResults, rfcId, eventStore } = props

  async function exportSpec() {
    setIsLoading(true)
    const spec = await ExportUtilities.toSharedSpecRepresentation({
      parentId: specService.id,
      specService,
      rfcId,
      eventStore,
      cachedQueryResults
    })

    const { id } = await sharedSpecUploadService.save(spec)
    debugger
    //@TODO: set base url to whatever.useoptic.com
    setUrl(`http://localhost:3000/shared/${id}`)
    setIsLoading(false)
  }
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Share</Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Share this API</DialogTitle>
        <DialogContent>
          <DialogContentText>You can share this link with anyone and they can build on it without affecting this version :)</DialogContentText>
          {isLoading && <div>Loading...</div>}
          {!isLoading && url && <a href={url}>{url}</a>}
        </DialogContent>
        <DialogActions>
          {url ? (
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          ) : (
              <Button onClick={exportSpec}>Get Share Link</Button>

            )}
        </DialogActions>
      </Dialog>
    </>
  )
}
const ShareButton = withRfcContext(ShareButtonBase)
export const notificationAreaComponent = (
  <SpecServiceContext.Consumer>
    {(context) => {
      const { specService } = context;
      return (
        <>
          <NewBehavior specService={specService} />
          <ShareButton specService={specService} />
        </>
      )
    }}
  </SpecServiceContext.Consumer>
)
const {
  Routes: SharedLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  notificationAreaComponent,
  basePath
})

export default SharedLoaderRoutes;