import { Response } from './response';
import { Body } from './body';
import { Operation } from './operation';
import { CookieParameter, HeaderParameter, PathParameter, QueryParameter } from './parameter';


export const Standard = {
  Response: Response,
  Body: Body,
  Operation: Operation,
  QueryParameter: QueryParameter,
  HeaderParameter: HeaderParameter,
  CookieParameter: CookieParameter,
  PathParameter: PathParameter
}

//
// export const Changes = {
//   operation: {
//     added: undefined,
//     removed: undefined,
//     changed: undefined,
//     required: undefined
//   },
//   property: {
//     added: undefined,
//     removed: undefined,
//     changed: undefined,
//     required: undefined
//   },
//   response: {
//
//   }
// }
//
//
