import { Command } from '@oclif/command'
import * as fs from 'fs-extra'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
import { getPaths } from '../Paths'
import { prepareEvents } from '../PersistUtils'
import * as express from 'express'
import * as getPort from 'get-port'
import bodyParser = require('body-parser')
import * as open from 'open'
import { readApiConfig } from './start';
import analytics from '../lib/analytics';
import Init, { IApiCliConfig } from './init';
interface IOpticDiffState {
  status: 'started' | 'persisted'
  interactionResults: Object
  acceptedInterpretations: any[]
}
interface IOpticRequestAdditions {
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

const sessionFileSuffix = '.optic_session.json';
const diffStateFileSuffix = '.optic_diff-state.json'
class SessionUtilities {
  sessionsPath: string;
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
    return sessions;
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

function makeInitialDiffState(): IOpticDiffState {
  return {
    status: 'started',
    interactionResults: {},
    acceptedInterpretations: [],
  }
}
export default class Spec extends Command {

  static description = 'Read the docs and design the API'

  static args = []

  async run() {
    let config: IApiCliConfig;
    try {
      config = await readApiConfig()
    } catch (e) {
      analytics.track('api spec missing config')
      this.log(`[incomplete setup] Optic needs some more information to continue.`)
      await Init.run([])
      return
    }
    const { specStorePath, sessionsPath } = await getPaths()
    const specFileExists = await fs.pathExists(specStorePath)

    if (specFileExists) {
      try {
        const specFileContents = await fs.readJson(specStorePath)
        if (!Array.isArray(specFileContents)) {
          throw new Error(`not array`)
        }
      } catch (e) {
        return this.error(`It looks like there is something wrong with your API spec file. Please make sure it is a valid JSON array.`)
      }

      const port = await getPort({ port: getPort.makeRange(3201, 3299) })

      await this.startServer(port, config)

      const sessionUtilities = new SessionUtilities(sessionsPath)
      const sessions = await sessionUtilities.getSessions()
      if (sessions.length > 0) {
        const [sessionId] = sessions;
        const isSessionStartable = await sessionUtilities.isSessionStartable(sessionId)
        if (isSessionStartable) {
          const url = `http://localhost:${port}/saved/diff/${sessionId}`
          this.log('diffing session against API spec on ' + url)
          this.log('keep this process running...')
          await open(url)
          return
        }
      }
      const url = `http://localhost:${port}/`
      this.log('opening API spec on ' + url)
      this.log('keep this process running...')
      await open(url)
    } else {
      return this.error("No API spec found in your working directory. Make sure you're in the directory with the .api folder.")
    }
  }

  async startServer(port: number, config: IApiCliConfig) {
    const { specStorePath, sessionsPath } = await getPaths()
    const sessionUtilities = new SessionUtilities(sessionsPath)
    const app = express()
    app.use(bodyParser.text({ type: 'text/html', limit: '100MB' }))

    app.get('/cli-api/events', async (req, res) => {
      const events = await fs.readJson(specStorePath)
      res.json(events)
    })
    app.put('/cli-api/events', bodyParser.json(), async (req, res) => {
      const newEvents = req.body
      await fs.writeFile(specStorePath, prepareEvents(newEvents))
      res.sendStatus(204)
    })

    app.get('/cli-api/sessions', async (req, res) => {
      const sessions = await sessionUtilities.getSessions()

      res.json({
        sessions
      })
    })

    async function validateSessionId(req: express.Request, res: express.Response, next: express.NextFunction) {
      const { sessionId } = req.params;
      const isSessionIdValid = sessionUtilities.doesSessionIdExist(sessionId)
      if (!isSessionIdValid) {
        return res.status(400).json({
          message: 'invalid session id'
        })
      }
      const diffStateFilePath = sessionUtilities.getDiffStateFilePath(sessionId)
      const diffStateExists = await fs.pathExists(diffStateFilePath)

      try {
        const diffState = diffStateExists ? await fs.readJson(diffStateFilePath) : makeInitialDiffState()
        const session = await fs.readJson(sessionUtilities.getSessionFilePath(sessionId))
        req.optic = {
          session,
          diffState
        }
        next()
      } catch (e) {
        console.error(e);
        next(e)
      }
    }

    app.get('/cli-api/sessions/:sessionId', validateSessionId, async (req, res) => {
      const { optic } = req;
      const { session } = optic;
      const hostname = require('url').parse(config.proxy.target).hostname
      res.json({
        hostname,
        session
      })
    })

    app.put('/cli-api/sessions/:sessionId/diff', bodyParser.json(), validateSessionId, async (req, res) => {
      const { sessionId } = req.params;
      const diffStateFileName = `${sessionId}${diffStateFileSuffix}`
      const diffStateFilePath = path.join(sessionsPath, diffStateFileName)
      await fs.writeJson(diffStateFilePath, req.body)
      res.sendStatus(204)
    })

    app.get('/cli-api/sessions/:sessionId/diff', validateSessionId, (req, res) => {
      const { optic } = req;
      const { diffState } = optic;
      res.json({
        diffState
      })
    })

    app.use(express.static(path.join(__dirname, '../../resources/react')))
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../resources/react/', 'index.html'))
    })

    await app.listen(port)
  }
}