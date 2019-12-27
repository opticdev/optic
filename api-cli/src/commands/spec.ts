import {Command} from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs-extra'
import * as path from 'path'
import {readLocalConfig} from '../lib/identity'
import {fromOptic} from '../lib/log-helper'
import {getPaths, IPathMapping} from '../Paths'
import {prepareEvents} from '../PersistUtils'
import * as express from 'express'
import * as getPort from 'get-port'
import bodyParser = require('body-parser')
import * as open from 'open'
import {readApiConfig} from './start'
import analytics from '../lib/analytics'
// @ts-ignore
import * as niceTry from 'nice-try'
import Init, {IApiCliConfig, IApiIntegrationsConfigHosts} from './init'
import {VersionControl} from '../lib/version-control'
// @ts-ignore
import * as opticEngine from '../../provided/domain.js'
import * as uuid from 'uuid'
import {Utilities} from '../lib/ui-server/utilities'

interface IOpticDiffState {
  status: 'started' | 'persisted'
  // tslint:disable-next-line:ban-types
  interactionResults: Object
  acceptedInterpretations: any[]
}

export interface IOpticRequestAdditions {
  // tslint:disable-next-line:ban-types
  session: Object
  diffState: IOpticDiffState
}

declare global {
  namespace Express {
    export interface Request {
      optic: IOpticRequestAdditions
    }
  }
}

const sessionFileSuffix = '.optic_session.json'
const diffStateFileSuffix = '.optic_diff-state.json'

class SessionUtilities {
  sessionsPath: string

  constructor(sessionsPath: string) {
    this.sessionsPath = sessionsPath
  }

  async getSessions() {
    const entries = await fs.readdir(this.sessionsPath)
    const sessions = entries
      .filter(x => x.endsWith(sessionFileSuffix))
      .map(x => x.substring(0, x.length - sessionFileSuffix.length))
      .sort((a, b) => {
        return b.localeCompare(a)
      })
    return sessions
  }

  async doesSessionIdExist(sessionId: string) {
    const entries = await fs.readdir(this.sessionsPath)
    const sessionFileName = this.getSessionFileName(sessionId)
    if (!entries.includes(sessionFileName)) {
      return false
    }
    return true
  }

  getSessionFileName(sessionId: string) {
    return `${sessionId}${sessionFileSuffix}`
  }

  getSessionFilePath(sessionId: string) {
    const sessionFileName = this.getSessionFileName(sessionId)
    const sessionFilePath = path.join(this.sessionsPath, sessionFileName)
    return sessionFilePath
  }

  getDiffStateFilePath(sessionId: string) {
    const diffStateFileName = `${sessionId}${diffStateFileSuffix}`
    const diffStateFilePath = path.join(this.sessionsPath, diffStateFileName)
    return diffStateFilePath
  }

  async isSessionStartable(sessionId: string) {
    const diffStateFilePath = this.getDiffStateFilePath(sessionId)
    const diffStateExists = await fs.pathExists(diffStateFilePath)
    if (!diffStateExists) {
      return true
    }
    const diffState = await fs.readJson(diffStateFilePath)
    if (diffState.status === 'persisted') {
      return false
    }
    return true
  }
}

export function makeInitialDiffState(): IOpticDiffState {
  return {
    status: 'started',
    interactionResults: {},
    acceptedInterpretations: [],
  }
}

export async function emitGitState() {
  try {
    const gitInfo = new VersionControl()
    const gitState = await gitInfo.getCurrentGitState()
    // @ts-ignore
    const {specStorePath} = await getPaths()
    const specStoreExists = await fs.pathExists(specStorePath)
    const eventsAsString = specStoreExists ? (await fs.readFile(specStorePath)).toString() : '[]'
    const Facade = opticEngine.com.seamless.contexts.rfc.RfcServiceJSFacade()
    const RfcCommandContext = opticEngine.com.seamless.contexts.rfc.RfcCommandContext
    const rfcId = 'testRfcId'
    const sessionId = uuid.v4()
    const batchId = uuid.v4()
    const commandContext = new RfcCommandContext(gitState.email || 'anonymous', sessionId, batchId)

    const eventStore = Facade.makeEventStore()
    eventStore.bulkAdd(rfcId, eventsAsString)
    const rfcService = Facade.fromJsonCommands(eventStore, rfcId, '[]', commandContext)

    const RfcCommands = opticEngine.com.seamless.contexts.rfc.Commands
    const commands = [
      RfcCommands.SetGitState(gitState.commitId, gitState.branch)
    ]
    rfcService.handleCommands(rfcId, commandContext, ...commands)
    const events = JSON.parse(eventStore.serializeEvents(rfcId))
    await fs.writeFile(specStorePath, prepareEvents(events))
  } catch (e) {
    // console.error(e)
  }

}

export default class Spec extends Command {

  static description = 'open the API Docs'

  static args = []

  async run() {
    let config: IApiCliConfig
    try {
      config = await readApiConfig()
    } catch (e) {
      analytics.track('api spec missing config')
      this.log('[incomplete setup] Optic needs some more information to continue.')
      await Init.run([])
      return
    }
    // @ts-ignore
    const {specStorePath, sessionsPath} = await getPaths()
    const specFileExists = await fs.pathExists(specStorePath)

    if (specFileExists) {
      try {
        const specFileContents = await fs.readJson(specStorePath)
        if (!Array.isArray(specFileContents)) {
          throw new Error('not array')
        }
      } catch (e) {
        return this.error(fromOptic('It looks like there is something wrong with your API spec file. Please make sure it is a valid JSON array.'))
      }
    }

    await emitGitState()

    const port = await getPort({port: getPort.makeRange(3201, 3299)})
    const sessionUtilities = new SessionUtilities(sessionsPath)
    const sessionValidatorAndLoader = new FileSystemSessionValidatorAndLoader(sessionUtilities)
    const paths = await getPaths()
    await startServer(paths, sessionValidatorAndLoader, port, config)

    const url = `http://localhost:${port}/`
    this.log(fromOptic('Displaying your API Spec at ' + url))
    await open(url)
    await cli.wait(1000)
    await cli.anykey('Press any key to exit')
    return process.exit()
  }
}

export interface ISessionValidatorAndLoader {
  validateSessionId(req: express.Request, res: express.Response, next: express.NextFunction): void
}

class FileSystemSessionValidatorAndLoader {
  sessionUtilities: SessionUtilities

  constructor(sessionUtilities: SessionUtilities) {
    this.sessionUtilities = sessionUtilities
  }

  validateSessionId = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {sessionId} = req.params
    const isSessionIdValid = this.sessionUtilities.doesSessionIdExist(sessionId)
    if (!isSessionIdValid) {
      return res.status(400).json({
        message: 'invalid session id'
      })
    }
    const diffStateFilePath = this.sessionUtilities.getDiffStateFilePath(sessionId)
    const diffStateExists = await fs.pathExists(diffStateFilePath)

    try {
      const diffState = diffStateExists ? await fs.readJson(diffStateFilePath) : makeInitialDiffState()
      const session = await fs.readJson(this.sessionUtilities.getSessionFilePath(sessionId))
      req.optic = {
        session,
        diffState
      }
      next()
    } catch (e) {
      console.error(e)
      next(e)
    }
  }
}

export async function startServer(paths: IPathMapping, sessionValidatorAndLoader: ISessionValidatorAndLoader, port: number, config: IApiCliConfig) {
  // @ts-ignore
  const {specStorePath, sessionsPath, exampleRequestsPath, integrationContracts, integrationExampleRequestsPath} = paths
  const sessionUtilities = new SessionUtilities(sessionsPath)
  const app = express()

  async function getExampleRequests(storagePath: string, requestId: string): Promise<any> {
    const exampleFilePath = path.join(storagePath, `${requestId}.json`)
    const currentFileContents = await (async () => {
      const exists = await fs.pathExists(exampleFilePath)
      if (exists) {
        return fs.readJson(exampleFilePath)
      }
      return []
    })()
    return currentFileContents
  }
  async function saveExampleRequest(storagePath: string, requestId: string, example: any) {
    const exampleFilePath = path.join(storagePath, `${requestId}.json`)
    const currentFileContents = await getExampleRequests(storagePath, requestId)
    currentFileContents.push(example)
    await fs.ensureDir(storagePath)
    await fs.writeJson(exampleFilePath, currentFileContents, {spaces: 2})
  }

  //Main API Spec
  app.get('/cli-api/events', async (req, res) => {
    try {
      const events = await fs.readJson(specStorePath)
      res.json(events)
    } catch (e) {
      res.json([])
    }
  })
  app.put('/cli-api/events', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const events = req.body
    await fs.writeFile(specStorePath, prepareEvents(events))
    res.sendStatus(204)
  })

  app.post('/cli-api/example-requests/:requestId', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const {requestId} = req.params
    await saveExampleRequest(exampleRequestsPath, requestId, req.body)
    res.sendStatus(204)
  })

  app.get('/cli-api/example-requests/:requestId', async (req, res) => {
    const {requestId} = req.params
    const currentFileContents = getExampleRequests(exampleRequestsPath, requestId)
    res.json({
      examples: currentFileContents
    })
  })

  // Sessions / Diff State
  app.get('/cli-api/sessions', async (req, res) => {
    const sessions = await sessionUtilities.getSessions()
    res.json({
      sessions
    })
  })

  app.put('/cli-api/sessions/:sessionId', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const {sessionId} = req.params
    const sessionFilePath = sessionUtilities.getSessionFilePath(sessionId)
    await fs.writeJson(sessionFilePath, req.body)
    res.json({
      sessionId
    })
  })
  app.get('/cli-api/sessions/:sessionId', sessionValidatorAndLoader.validateSessionId, async (req, res) => {
    const {optic} = req
    const {session} = optic
    res.json({
      session
    })
  })

  app.get('/cli-api/command-context', async (req, res) => {
    try {
      const gitState = await new VersionControl().getCurrentGitState()
      res.json({userId: gitState.email})
    } catch (e) {
      res.sendStatus(500)
    }
  })

  app.get('/cli-api/identity', async (req, res) => {
    const {user_id, doNotTrack} = readLocalConfig()
    res.json({distinctId: user_id, doNotTrack})
  })
  //Integrations
  app.get('/cli-api/integrations', async (req, res) => {
    const integrations = config.integrations || []
    integrations.forEach(i => i.host = IApiIntegrationsConfigHosts(i))
    res.json({integrations})
  })
  app.get('/cli-api/integrations/:integrationName/events', async (req, res) => {
    const {integrationName} = req.params
    const expectedPath = path.join(integrationContracts, `${integrationName}_contract.json`)
    const events = niceTry(() => {
      const contents = fs.readFileSync(expectedPath).toString()
      return JSON.parse(contents)
    })
    if (fs.existsSync(expectedPath)) {
      res.json(events)
    } else {
      res.sendStatus(404)
    }
  })
  app.put('/cli-api/integrations/:integrationName/events', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const events = req.body
    const {integrationName} = req.params
    console.log(integrationName)
    const expectedPath = path.join(integrationContracts, `${integrationName}_contract.json`)
    await fs.writeFile(expectedPath, prepareEvents(events))
    res.sendStatus(204)
  })
  app.post('/cli-api/integrations/:integrationName/example-requests/:requestId', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const {requestId} = req.params
    await saveExampleRequest(integrationExampleRequestsPath, requestId, req.body)
    res.sendStatus(204)
  })

  app.get('/cli-api/integrations/:integrationName/example-requests/:requestId', async (req, res) => {
    const {requestId} = req.params
    const currentFileContents = await getExampleRequests(integrationExampleRequestsPath, requestId)
    res.json({
      examples: currentFileContents
    })
  })

  Utilities.addUiServer(app)

  await app.listen(port)
}
