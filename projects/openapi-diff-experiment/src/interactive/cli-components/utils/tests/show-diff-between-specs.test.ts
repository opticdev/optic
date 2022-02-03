import { IFilePatch } from '../../../../services/patch/types';
import { showDiffBetweenSpecs } from '../show-diff-between-specs';

describe('show diff between specs', () => {
  it('in a single file, one chunk', async () => {
    expect(showDiffBetweenSpecs(example1)).toMatchSnapshot();
  });
  it('in a single file, one chunk', async () => {
    expect(showDiffBetweenSpecs(example2)).toMatchSnapshot();
  });
  // in a single files, multiple chunks

  // across multiple files, multiple chunks
});

const example1: IFilePatch = {
  files: [
    {
      path: 'openapi.json',
      previousContents:
        '{\n  "openapi": "3.0.1",\n  "paths": {\n    "/example": {\n      "parameters": [],\n      "get": {\n        "parameters": [],\n        "responses": {\n          "200": {\n            "description": "",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "type": "object",\n                  "properties": {\n                    "owner": {\n                      "type": "object",\n                      "properties": {\n                        "login": {\n                          "type": "string"\n                        },\n                        "id": {\n                          "type": "number"\n                        },\n                        "node_id": {\n                          "type": "string"\n                        },\n                        "avatar_url": {\n                          "type": "string"\n                        },\n                        "gravatar_id": {\n                          "type": "string"\n                        },\n                        "url": {\n                          "type": "string"\n                        },\n                        "html_url": {\n                          "type": "string"\n                        },\n                        "followers_url": {\n                          "type": "string"\n                        },\n                        "type": {\n                          "type": "string"\n                        },\n                        "site_admin": {\n                          "type": "boolean"\n                        }\n                      },\n                      "required": [\n                        "login",\n                        "id",\n                        "node_id",\n                        "avatar_url",\n                        "gravatar_id",\n                        "url",\n                        "html_url",\n                        "followers_url",\n                        "type",\n                        "site_admin"\n                      ]\n                    }\n                  },\n                  "required": [\n                    "owner"\n                  ]\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  "info": {\n    "version": "0.0.0",\n    "title": "Empty"\n  }\n}',
      newContents:
        '{\n  "openapi": "3.0.1",\n  "paths": {\n    "/example": {\n      "parameters": [],\n      "get": {\n        "parameters": [],\n        "responses": {\n          "200": {\n            "description": "",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "type": "object",\n                  "properties": {\n                    "owner": {\n                      "type": "object",\n                      "properties": {\n                        "login": {\n                          "type": "string"\n                        },\n                        "id": {\n                          "type": "number"\n                        },\n                        "node_id": {\n                          "type": "string"\n                        },\n                        "avatar_url": {\n                          "type": "string"\n                        },\n                        "gravatar_id": {\n                          "type": "string"\n                        },\n                        "url": {\n                          "type": "string"\n                        },\n                        "html_url": {\n                          "type": "string"\n                        },\n                        "followers_url": {\n                          "type": "string"\n                        },\n                        "type": {\n                          "type": "string"\n                        },\n                        "site_admin": {\n                          "type": "boolean"\n                        }\n                      },\n                      "required": [\n                        "login",\n                        "id",\n                        "node_id",\n                        "avatar_url",\n                        "url",\n                        "html_url",\n                        "followers_url",\n                        "type",\n                        "site_admin"\n                      ]\n                    }\n                  },\n                  "required": [\n                    "owner"\n                  ]\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  "info": {\n    "version": "0.0.0",\n    "title": "Empty"\n  }\n}',
    },
  ],
};
const example2: IFilePatch = {
  files: [
    {
      path: 'openapi.json',
      previousContents:
        '{\n  "openapi": "3.0.1",\n  "paths": {\n    "/example": {\n      "parameters": [],\n      "get": {\n        "parameters": [],\n        "responses": {\n          "200": {\n            "description": "",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "type": "object",\n                  "properties": {\n                    "owner": {\n                      "type": "object",\n                      "properties": {\n                        "login": {\n                          "type": "string"\n                        },\n                        "id": {\n                          "type": "number"\n                        },\n                        "node_id": {\n                          "type": "string"\n                        },\n                        "avatar_url": {\n                          "type": "string"\n                        },\n                        "gravatar_id": {\n                          "type": "string"\n                        },\n                        "url": {\n                          "type": "string"\n                        },\n                        "html_url": {\n                          "type": "string"\n                        },\n                        "followers_url": {\n                          "type": "string"\n                        },\n                        "type": {\n                          "type": "string"\n                        },\n                        "site_admin": {\n                          "type": "boolean"\n                        }\n                      },\n                      "required": [\n                        "login",\n                        "id",\n                        "node_id",\n                        "avatar_url",\n                        "gravatar_id",\n                        "url",\n                        "html_url",\n                        "followers_url",\n                        "type",\n                        "site_admin"\n                      ]\n                    }\n                  },\n                  "required": [\n                    "owner"\n                  ]\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  "info": {\n    "version": "0.0.0",\n    "title": "Empty"\n  }\n}',
      newContents:
        '{\n' +
        '  "openapi": "3.0.1",\n' +
        '  "paths": {\n' +
        '    "/example": {\n' +
        '      "get": {\n' +
        '        "parameters": [],\n' +
        '        "responses": {\n' +
        '          "200": {\n' +
        '            "description": "",\n' +
        '            "content": {\n' +
        '              "application/json": {\n' +
        '                "schema": {\n' +
        '                  "type": "object",\n' +
        '                  "properties": {\n' +
        '                    "owner": {\n' +
        '                      "type": "object",\n' +
        '                      "properties": {\n' +
        '                        "login": {\n' +
        '                          "type": "string"\n' +
        '                        },\n' +
        '                        "id": {\n' +
        '                          "type": "number"\n' +
        '                        },\n' +
        '                        "node_id": {\n' +
        '                          "type": "string"\n' +
        '                        },\n' +
        '                        "avatar_url": {\n' +
        '                          "type": "string"\n' +
        '                        },\n' +
        '                        "gravatar_id": {\n' +
        '                          "type": "string"\n' +
        '                        },\n' +
        '                        "url": {\n' +
        '                          "type": "string"\n' +
        '                        },\n' +
        '                        "type": {\n' +
        '                          "type": "string"\n' +
        '                        },\n' +
        '                        "site_admin": {\n' +
        '                          "type": "boolean"\n' +
        '                        }\n' +
        '                      },\n' +
        '                      "required": [\n' +
        '                        "login",\n' +
        '                        "id",\n' +
        '                        "node_id",\n' +
        '                        "avatar_url",\n' +
        '                        "gravatar_id",\n' +
        '                        "url",\n' +
        '                        "type",\n' +
        '                        "site_admin"\n' +
        '                      ]\n' +
        '                    }\n' +
        '                  },\n' +
        '                  "required": [\n' +
        '                    "owner"\n' +
        '                  ]\n' +
        '                }\n' +
        '              }\n' +
        '            }\n' +
        '          }\n' +
        '        }\n' +
        '      }\n' +
        '    }\n' +
        '  },\n' +
        '  "info": {\n' +
        '    "version": "0.0.0",\n' +
        '    "title": "Empty"\n' +
        '  }\n' +
        '}',
    },
  ],
};
