import express from 'express';

export function middleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const tokenHeader = req.headers['Authorization'];
  if (!tokenHeader || tokenHeader.length !== 1) {
    return res.sendStatus(401);
  }
  const [tokenValue] = tokenHeader;
  const prefix = 'Bearer ';
  const token = tokenValue.substring(prefix.length);
  // decode jwt with secret
  // choose session api
}
