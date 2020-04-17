import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as keytar from 'keytar';
//@ts-ignore
import * as jwtDecode from 'jwt-decode';
import * as http from 'http';
import { EventEmitter } from 'events';
import * as getPort from 'get-port';
import { IUser, IUserCredentials } from '@useoptic/cli-config';

const serviceName = 'optic8plus';
const accountName = 'default';

interface ICredentialsServerConfig {
  port: number
}

export const loginBaseUrl = process.env.OPTIC_AUTH_UI_HOST || `https://auth.useoptic.com`
export const tokenReceivedEvent: string = 'tokenReceived';

class CredentialsServer {
  private server!: http.Server;
  public events: EventEmitter = new EventEmitter();

  async start(config: ICredentialsServerConfig) {
    const app = express();
    const whitelist = [loginBaseUrl];
    const corsOptions: cors.CorsOptions = {
      origin: whitelist
    };

    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(cors(corsOptions));
    const path = '/api/token';
    app.put(path, async (req, res) => {
      const { body } = req;
      const { idToken } = body;
      if (typeof idToken === 'string') {
        this.events.emit(tokenReceivedEvent, idToken);
        return res.status(202).json({});
      } else {
        return res.status(400).json({});
      }
    });

    this.server = app.listen(config.port);
  }

  async stop() {
    await new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

export async function ensureCredentialsServerStarted() {
  const port = await getPort({ port: getPort.makeRange(3300, 3900) });
  const server = new CredentialsServer();
  await server.start({ port });
  return {
    server,
    port
  };
}


export async function setCredentials(credentials: IUserCredentials) {
  await keytar.setPassword(serviceName, accountName, credentials.token);
}

export async function getCredentials(): Promise<IUserCredentials | null> {
  const token = await keytar.getPassword(serviceName, accountName);
  if (token) {
    return { token };
  }
  return null;
}

export async function getUserFromCredentials(credentials: IUserCredentials): Promise<IUser> {
  return jwtDecode(credentials.token);
}
