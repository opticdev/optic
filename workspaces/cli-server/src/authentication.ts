import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as keytar from 'keytar';
//@ts-ignore
import jwtDecode from 'jwt-decode';

const serviceName = 'optic8plus';
const accountName = 'default';

export function makeAuthenticationServer() {
  const app = express();
  // authentication
  const whitelist = ['https://auth.useoptic.com', 'http://localhost:4005'];
  const corsOptions: cors.CorsOptions = {
    origin: whitelist,
    methods: ['PUT']
  };

  app.use(bodyParser({ limit: '1mb' }));

  const url = '/admin-api/authenticate';
  app.options(url, cors(corsOptions));
  app.get(url, cors(corsOptions), (req, res) => {
    res.json({ authServerActive: true });
  });
  app.put(url, cors(corsOptions), async (req, res) => {
    const { body } = req;
    const { idToken } = body;
    if (typeof idToken === 'string') {
      keytar.setPassword(serviceName, accountName, idToken);
      res.status(200);
      res.json({});
    } else {
      res.status(400);
      res.json({});
    }
  });

  return app.listen(50366);

}

export const getUser = async () => {
  try {
    const idToken = await keytar.getPassword(serviceName, accountName);
    if (idToken) {
      return jwtDecode(idToken);
    }
  } catch {
    return;
  }
};
