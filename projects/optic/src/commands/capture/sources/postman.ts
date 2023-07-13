import { Readable } from 'stream';
import { Result, Ok } from 'ts-results';
import invariant from 'ts-invariant';
import {
  Collection,
  CollectionDefinition,
  Item,
  ItemGroupDefinition,
  Request,
  RequestBody,
  Response,
  VariableScope,
} from 'postman-collection';

// Fix incorrect type definition
export type ExtendedRequest = Request & {
  body?: RequestBody & {
    options?: {
      raw?: {
        language?: string;
      };
    };
  };
};

// Fix incorrect type definition
export type ExtendedResponse = Response & {
  contentInfo(): {
    contentType: string;
    mimeType: string;
    mimeFormat: string;
    charset: string;
    extension: string;
  };
};

// Fix incorrect type definition
export type ExtendedVariableScope = VariableScope & {
  replaceIn(template: string): string;
};

export type PostmanEntry = {
  request: ExtendedRequest;
  response?: ExtendedResponse;
  variableScope: ExtendedVariableScope;
};

export interface PostmanCollectionEntries extends AsyncIterable<PostmanEntry> {}
export interface TryPostmanCollection
  extends AsyncIterable<Result<PostmanEntry, Error>> {}

export class PostmanCollectionEntries {
  // Note: The postman-collection SDK doesn't support async
  // data loading. The implementation of this function essentially
  // turns fromReadable into a synchronous iterable, but we maintain
  // the async interface.
  static async *fromReadable(source: Readable): TryPostmanCollection {
    invariant(
      !source.readableObjectMode,
      'Expecting raw bytes to parse Postman Collection entries'
    );

    // Read to end as UTF-8 string
    let collectionSource = '';
    source.setEncoding('utf-8');
    for await (const chunk of source) {
      collectionSource += chunk;
    }

    // Ensure input can be parsed as JSON.
    let collectionDefinition:
      | (CollectionDefinition & ItemGroupDefinition)
      | null = null;
    try {
      collectionDefinition = JSON.parse(collectionSource);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(
          `Source could not be read as Postman Collection: ${err.message}`
        );
      } else {
        throw err;
      }
    }

    // Only iterate if this collection is non-empty.
    if (!collectionDefinition?.item) {
      return;
    }

    const collection = new Collection(collectionDefinition);
    const variableScope = new VariableScope(
      collection.variables
    ) as ExtendedVariableScope;

    // Recursively iterate through folders.
    const items: Item[] = [];
    collection.forEachItem((item) => items.push(item));

    // Yield valid PostmanEntry items.
    for (const item of items) {
      yield Ok({
        request: item.request as ExtendedRequest,
        variableScope,
      });

      for (const res of item.responses.all()) {
        const request = res.originalRequest;
        const response = res as ExtendedResponse;
        if (request && response) yield Ok({ request, response, variableScope });
      }
    }
  }
}
