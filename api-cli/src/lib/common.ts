import { Request } from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { Express } from 'express';

export function addBodyParsers(app: Express) {
    const limit = '100mb';
    app.use(bodyParser.json({ limit }));
    app.use(bodyParser.urlencoded({ limit, extended: true }));
    app.use(bodyParser.text({ limit, type: '*/*' }));
    app.use(cookieParser());
}

export function packageRequest(req: Request) {
    const request: IRequestMetadata = {
        queryParameters: req.query,
        body: req.body,
        headers: req.headers,
        cookies: req.cookies,
        method: req.method,
        url: req.path,
    };

    return request;
}

export interface IHeaders {
    [key: string]: string | string[] | undefined
}

export interface IParameterMapping {
    [key: string]: string
}

export interface IMultiParameterMapping {
    [key: string]: string | string[]
}

export interface IRequestMetadata {
    url: string,
    method: string
    headers: IHeaders
    cookies: IParameterMapping
    queryParameters: IMultiParameterMapping
    body?: object
}

export interface IResponseMetadata {
    statusCode: number
    headers: IHeaders
    body?: object | string

}

export interface IApiInteraction {
    request: IRequestMetadata
    response: IResponseMetadata
}


export function groupByKey<T>(keyFn: (item: T) => string) {
    return (acc: Map<string, T[]>, value: T) => {
        const key = keyFn(value);
        acc.set(key, [...(acc.get(key) || []), value]);

        return acc;
    };
}
