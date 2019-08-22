import { Command, flags } from '@oclif/command'
import * as fp from 'find-free-port'
import * as express from 'express'
import cli from 'cli-ux'
import * as open from 'open'
import * as cors from 'cors'
import * as colors from 'colors'

export default class Login extends Command {
  static description = 'documents your API by monitoring local traffic'

  static flags = {
    // 'add-token': flags.boolean({ description: 'uses this jwt token to authorize the cli' })
  }

  static args = []

  async run() {
    const tokenService = new TokenListenerService()
    cli.action.start('waiting for login')
    const pending = await tokenService.waitForToken(this)
    const token = await pending.tokenPromise
    cli.action.stop(colors.green('CLI Authenticated'))
    tokenService.stop()
    process.exit(0)
  }
}

type TokenSession = {
  tokenPromise: Promise<string>
  responsePort: number
}

export class TokenListenerService {
  private readonly app = express()
  private server: any

  waitForToken(cli: Command) {
    return new Promise<TokenSession>(resolve => {
      const tokenPromise = new Promise<string>((tokenResolve => {
        fp(this.randomPort(), (_: any, responsePort: number) => {
          resolve({tokenPromise, responsePort})
          this.app.get('/token/:token', cors(), (req: express.Request, res: express.Response) => {
            res.send(`<!DOCTYPE html>
<html lang="en">
<body>
Logged into Optic CLI -- you can close this page at any time
</body>
</html>
`)
            tokenResolve(req.params.token)
          })

          this.server = this.app.listen(responsePort, () => {
            open('http://localhost:3000/login?cli_port=' + responsePort.toString())
          })
        })
      }))
    })
  }

  stop() {
    if (this.server) {
      this.server.close()
    }
  }

  public randomPort() {
    const high = 9000
    const low = 3000
    return Math.floor(Math.random() * (high - low) + low)
  }

}
