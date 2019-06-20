import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
import cli from 'cli-ux'
import {readmePath, specStorePath} from '../Paths'
import {prepareEvents} from '../PersistUtils'
import * as express from 'express'
import * as getPort from 'get-port'
import bodyParser = require('body-parser')
import * as open from 'open'

export default class Spec extends Command {

  static description = 'Read the docs and design the spec for this API'

  static args = []

  async run() {
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

  async startServer(events: any[]) {
    let updatedEvents = events

    const app = express()
    app.use(bodyParser.text({type: 'text/html', limit: '100MB'}))
    const port = await getPort({port: getPort.makeRange(3200, 3299)})
    app.get('/events.json', (req, res) => {
      res.json(updatedEvents)
    })
    app.post('/save', (req, res) => {
      const newEvents = JSON.parse(req.body)
      updatedEvents = newEvents
      fs.writeFileSync(specStorePath, prepareEvents(newEvents))
      res.sendStatus(200)
    })
    app.use(express.static(path.join(__dirname, '../../resources/react')))
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../resources/react/', 'index.html'))
    })

    await app.listen(port)
    const url = 'http://localhost:3200'
    this.log('opening api spec on ' + url)
    this.log('keep this process running...')
    await open(url)
  }
}
