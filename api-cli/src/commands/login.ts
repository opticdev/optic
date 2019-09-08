import {Command, flags} from '@oclif/command'
// @ts-ignore
import * as fp from 'find-free-port'
import * as express from 'express'
import cli from 'cli-ux'
import * as open from 'open'
// @ts-ignore
import * as cors from 'cors'
import * as colors from 'colors'
import {trackSlack} from '../lib/analytics'
import {getUser, saveUser} from '../lib/credentials'

export default class Login extends Command {
  static description = 'authenticates the Optic CLI'

  static flags = {
    'login-flow': flags.boolean()
  }

  static args = []

  async run() {
    const {flags} = this.parse(Login)
    const loginFlow = flags['login-flow']

    if (loginFlow) {
      trackSlack('first time install')
    }
    if (loginFlow && await getUser()) {
      return //kill it if we're already authenticated and in the login flow
    }
    const tokenService = new TokenListenerService()
    cli.action.start('waiting for login')
    const pending = await tokenService.waitForToken(this)
    const token = await pending.tokenPromise
    await saveUser(token)
    cli.action.stop(colors.green('CLI Authenticated'))
    trackSlack('user authenticated')
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
<script type="application/javascript">
window.location.href = 'https://dashboard.useoptic.com';
</script>
<body>
Logged into Optic CLI -- redirecting you to <a href="https://dashboard.useoptic.com">https://dashboard.useoptic.com</a>
</body>
</html>
`)
            tokenResolve(req.params.token)
          })

          this.server = this.app.listen(responsePort, () => {
            open('https://dashboard.useoptic.com/login?cli_port=' + responsePort.toString())
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
