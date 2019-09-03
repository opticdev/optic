//@ts-ignore
declare global {
  namespace Express {
    export interface Request {
      account: Account;
      authenticaticated: boolean
    }
  }
}
