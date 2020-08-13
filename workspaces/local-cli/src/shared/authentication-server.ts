import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
//@ts-ignore
import jwtDecode from 'jwt-decode';
import http from 'http';
import { EventEmitter } from 'events';
import getPort from 'get-port';
import { IUser, IUserCredentials } from '@useoptic/cli-config';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';

const opticrcPath = path.resolve(os.homedir(), '.opticrc');

interface IUserStorage {
  idToken: string;
}

interface ICredentialsServerConfig {
  port: number;
}

export const loginBaseUrl =
  process.env.OPTIC_AUTH_UI_HOST || `https://app.useoptic.com`;
export const tokenReceivedEvent: string = 'tokenReceived';

class CredentialsServer {
  private server!: http.Server;
  public events: EventEmitter = new EventEmitter();

  async start(config: ICredentialsServerConfig) {
    const app = express();
    const whitelist = [
      loginBaseUrl,
      'https://auth.useoptic.com', // regression
      'https://app.o3c.info', // staging
    ];
    const corsOptions: cors.CorsOptions = {
      origin: whitelist,
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

export async function ensureCredentialsServerStarted(
  overridePort: number | undefined = undefined
) {
  const port =
    overridePort || (await getPort({ port: getPort.makeRange(3300, 3900) }));
  const server = new CredentialsServer();
  await server.start({ port });
  return {
    server,
    port,
  };
}

export async function setCredentials(credentials: IUserCredentials) {
  const storeValue: IUserStorage = {
    idToken: credentials.token,
  };

  await fs.ensureFile(opticrcPath);
  await fs.writeFile(opticrcPath, JSON.stringify(storeValue));
}

export async function deleteCredentials() {
  try {
    await fs.remove(opticrcPath);
  } catch (e) {}
}

export async function getCredentials(): Promise<IUserCredentials | null> {
  try {
    const storage: IUserStorage = await fs.readJSON(opticrcPath);
    if (storage.idToken) {
      return { token: storage.idToken };
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function getUserFromCredentials(
  credentials: IUserCredentials
): Promise<IUser> {
  return jwtDecode(credentials.token);
}
