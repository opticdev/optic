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
interface IOpticRequestAdditions {
  session: Object
  diffState: Object
}
declare global {
  namespace Express {
    export interface Request {
      optic: IOpticRequestAdditions
    }
  }
}
export default class Spec extends Command {

  static description = 'Read the docs and design the API'

  static args = []

  async run() {
    const { specStorePath } = await getPaths()
    if (fs.existsSync(specStorePath)) {
      const events = niceTry(() => {
        const savedEvents = fs.readFileSync(specStorePath).toString()
        const parsedJson = JSON.parse(savedEvents)
        if (Array.isArray(parsedJson) && parsedJson.every(i => typeof i === 'object')) {
          return parsedJson
        }
      })
      if (!events) {
        return this.error('Invalid event persistence format. Check the file for any conflicts.')
      }
      return this.startServer(events)
    } else {
      return this.error("No API spec found in your working directory. Make sure you're in the directory with the .api folder.")
    }
  }

  async getSessions() {
    // find sessions and session state files
  }

  async getLatestSession() {

  }

  async startServer(events: any[]) {
    const { specStorePath, sessionsPath } = await getPaths()
    let updatedEvents = events
    const sessionFileSuffix = '.optic_session.json';
    const diffStateFileSuffix = '.optic_diff-state.json'
    const app = express()
    app.use(bodyParser.text({ type: 'text/html', limit: '100MB' }))
    const port = await getPort({ port: getPort.makeRange(3200, 3299) })

    app.get('/cli-api/events', (req, res) => {
      res.json(updatedEvents)
    })
    app.put('/cli-api/events', bodyParser.json(), (req, res) => {
      const newEvents = req.body
      updatedEvents = newEvents
      fs.writeFileSync(specStorePath, prepareEvents(newEvents))
      res.sendStatus(200)
    })

    app.get('/cli-api/sessions', async (req, res) => {
      const entries = await fs.readdir(sessionsPath)
      const sessions = entries
        .filter(x => x.endsWith(sessionFileSuffix))
        .map(x => x.substring(0, x.length - sessionFileSuffix.length))
        .sort((a, b) => {
          return b.localeCompare(a)
        })

      res.json({
        sessions
      })
    })

    async function validateSessionId(req: express.Request, res: express.Response, next: express.NextFunction) {
      const entries = await fs.readdir(sessionsPath)
      const { sessionId } = req.params;
      const sessionFileName = `${sessionId}${sessionFileSuffix}`
      if (!entries.includes(sessionFileName)) {
        return res.status(400).json({
          message: 'invalid session id'
        })
      }

      const diffStateFileName = `${sessionId}${diffStateFileSuffix}`
      const diffStateFilePath = path.join(sessionsPath, diffStateFileName)
      const diffStateExists = await fs.pathExists(diffStateFilePath)
      console.log({ diffStateExists })
      try {
        const diffState = diffStateExists ? await fs.readJson(diffStateFilePath) : {interactionResults: {}, commands: []}
        const session = await fs.readJson(path.join(sessionsPath, sessionFileName))
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
      res.json({
        session
      })
    })

    app.put('/cli-api/sessions/:sessionId/diff', bodyParser.json(), validateSessionId, async (req, res) => {
      const { sessionId } = req.params;
      const diffStateFileName = `${sessionId}${diffStateFileSuffix}`
      const diffStateFilePath = path.join(sessionsPath, diffStateFileName)
      console.log(req.body)
      await fs.writeJson(diffStateFilePath, req.body)
      res.status(201).end()
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
    const url = `http://localhost:${port}/`
    this.log('opening api spec on ' + url)
    this.log('keep this process running...')
    await open(url)
  }
}
/*
- sessions are saved in .api/sessions folder
- *.optic_session.json
- find latest one
- load *.optic_diff-state.json
*/