import deepCopy from 'deepcopy';
import { RootState } from '<src>/store';

// TODO provide overrides for this store
export const getMockReduxStore = (): RootState =>
  deepCopy({
    endpoints: {
      results: {
        loading: false,
        data: {
          endpoints: [
            {
              id: 'path_UOIsxzICu5.GET',
              pathId: 'path_UOIsxzICu5',
              method: 'GET',
              description: '',
              purpose: 'get api todos',
              isRemoved: false,
              fullPath: '/api/todos',
              pathParameters: [
                {
                  id: 'root',
                  name: '',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_UOIsxzICu5.GET',
                },
                {
                  id: 'path_DuKsKy5MFb',
                  name: 'api',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_UOIsxzICu5.GET',
                },
                {
                  id: 'path_UOIsxzICu5',
                  name: 'todos',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_UOIsxzICu5.GET',
                },
              ],
              query: null,
              requests: [
                {
                  requestId: 'request_gwQEFrHpO0',
                  body: {
                    rootShapeId: 'shape_cEkQAVQ3ib',
                    contentType: 'application/json',
                  },
                  description: '',
                  endpointId: 'path_UOIsxzICu5.GET',
                  pathId: 'path_UOIsxzICu5',
                  method: 'GET',
                  isRemoved: false,
                },
              ],
              responsesByStatusCode: {
                '200': [
                  {
                    responseId: 'response_Zv48g7lL5e',
                    statusCode: 200,
                    description: '',
                    endpointId: 'path_UOIsxzICu5.GET',
                    pathId: 'path_UOIsxzICu5',
                    method: 'GET',
                    isRemoved: false,
                    body: {
                      rootShapeId: 'shape_0xeeapZ7UZ',
                      contentType: 'application/json',
                    },
                  },
                ],
              },
            },
            {
              id: 'path_xhUZ8irdJO.GET',
              pathId: 'path_xhUZ8irdJO',
              method: 'GET',
              description: 'gets all the completed todos',
              purpose: 'get completed items on list',
              isRemoved: false,
              fullPath: '/api/lists/{listId}/completed',
              pathParameters: [
                {
                  id: 'root',
                  name: '',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_xhUZ8irdJO.GET',
                },
                {
                  id: 'path_DuKsKy5MFb',
                  name: 'api',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_xhUZ8irdJO.GET',
                },
                {
                  id: 'path_F22U4m3ddD',
                  name: 'lists',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_xhUZ8irdJO.GET',
                },
                {
                  id: 'path_AsEexQkVwC',
                  name: 'listId',
                  isParameterized: true,
                  description: '',
                  endpointId: 'path_xhUZ8irdJO.GET',
                },
                {
                  id: 'path_xhUZ8irdJO',
                  name: 'completed',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_xhUZ8irdJO.GET',
                },
              ],
              query: {
                queryParametersId: 'query_LqY12Qc9Mi',
                rootShapeId: 'shape_tNRgroSwLj',
                isRemoved: false,
                description: '',
                endpointId: 'path_xhUZ8irdJO.GET',
                pathId: 'path_xhUZ8irdJO',
                method: 'GET',
              },
              requests: [
                {
                  requestId: 'request_SqY61Qc9Mi',
                  body: {
                    rootShapeId: 'shape_Lx1MrhWlFb',
                    contentType: 'application/json',
                  },
                  description: 'request body param',
                  endpointId: 'path_xhUZ8irdJO.GET',
                  pathId: 'path_xhUZ8irdJO',
                  method: 'GET',
                  isRemoved: false,
                },
              ],
              responsesByStatusCode: {
                '200': [
                  {
                    responseId: 'response_RkkvxIt2RG',
                    statusCode: 200,
                    description: 'response body',
                    endpointId: 'path_xhUZ8irdJO.GET',
                    pathId: 'path_xhUZ8irdJO',
                    method: 'GET',
                    isRemoved: false,
                    body: {
                      rootShapeId: 'shape_ToF242uYVA',
                      contentType: 'application/json',
                    },
                  },
                ],
              },
            },
            {
              id: 'path_wPHNu8BDab.GET',
              pathId: 'path_wPHNu8BDab',
              method: 'GET',
              description: '',
              purpose: 'get profile of todo author',
              isRemoved: false,
              fullPath: '/api/todos/{todoId}/profile',
              pathParameters: [
                {
                  id: 'root',
                  name: '',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_wPHNu8BDab.GET',
                },
                {
                  id: 'path_DuKsKy5MFb',
                  name: 'api',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_wPHNu8BDab.GET',
                },
                {
                  id: 'path_UOIsxzICu5',
                  name: 'todos',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_wPHNu8BDab.GET',
                },
                {
                  id: 'path_it2OyjUysW',
                  name: 'todoId',
                  isParameterized: true,
                  description: '',
                  endpointId: 'path_wPHNu8BDab.GET',
                },
                {
                  id: 'path_wPHNu8BDab',
                  name: 'profile',
                  isParameterized: false,
                  description: '',
                  endpointId: 'path_wPHNu8BDab.GET',
                },
              ],
              query: null,
              requests: [
                {
                  requestId: 'request_3kjV3YMXdP',
                  body: {
                    rootShapeId: 'shape_FMLvgzBZRK',
                    contentType: 'application/json',
                  },
                  description: '',
                  endpointId: 'path_wPHNu8BDab.GET',
                  pathId: 'path_wPHNu8BDab',
                  method: 'GET',
                  isRemoved: false,
                },
              ],
              responsesByStatusCode: {
                '200': [
                  {
                    responseId: 'response_dE2gzm1TWj',
                    statusCode: 200,
                    description: '',
                    endpointId: 'path_wPHNu8BDab.GET',
                    pathId: 'path_wPHNu8BDab',
                    method: 'GET',
                    isRemoved: false,
                    body: {
                      rootShapeId: 'shape_atTrTmH6j9',
                      contentType: 'application/json',
                    },
                  },
                ],
              },
            },
          ],
          changes: {},
        },
      },
    },
    documentationEdits: {
      contributions: {},
      deletedEndpoints: [],
      commitModalOpen: false,
      isEditing: false,
    },
    metadata: {
      loading: false,
      data: {
        apiName: 'todos-partial',
        clientAgent: 'anon_id',
        specificationId: 'b47d8f6e-d0e4-4814-9db6-add26b96ddd2',
        sessionId: 'e57695d3-9ea8-4d34-abd7-a34a746b7c02',
      },
    },
    diff: {
      state: {
        loading: true,
      },
    },
    paths: {
      results: {
        loading: true,
      },
    },
    shapes: {
      rootShapes: {
        shape_cEkQAVQ3ib: {
          loading: false,
          data: 'shape_cEkQAVQ3ib',
        },
        shape_0xeeapZ7UZ: {
          loading: false,
          data: 'shape_0xeeapZ7UZ',
        },
        shape_tNRgroSwLj: {
          loading: false,
          data: 'shape_tNRgroSwLj',
        },
      },
      shapeMap: {
        shape_tNRgroSwLj: [
          {
            shapeId: 'shape_tNRgroSwLj',
            jsonType: 'Object',
            asObject: {
              fields: [
                {
                  name: 'status',
                  fieldId: 'field_W8dnCvOHU',
                  shapeId: 'shape_ZL8uOU2HQF',
                  contributions: {},
                  changes: 'added',
                },
                {
                  name: 'author',
                  fieldId: 'field_hnI7P1UdbB',
                  shapeId: 'shape_qQT0krhOKn',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
              ],
            },
          },
        ],
        shape_qQT0krhOKn: [
          {
            shapeId: 'shape_qQT0krhOKn',
            jsonType: 'String',
          },
        ],
        shape_Lx1MrhWlFb: [
          {
            shapeId: 'shape_Lx1MrhWlFb',
            jsonType: 'Array',
            asArray: {
              shapeId: 'shape_QU1rtECeM2',
            },
          },
        ],
        shape_QU1rtECeM2: [
          {
            shapeId: 'shape_QU1rtECeM2',
            jsonType: 'Object',
            asObject: {
              fields: [
                {
                  name: 'task',
                  fieldId: 'field_KqnBpTROYU',
                  shapeId: 'shape_9GDAmGAINi',
                  contributions: {
                    description: 'the task',
                  },
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'isDone',
                  fieldId: 'field_acS3yeUZo4',
                  shapeId: 'shape_4yRQwm4WOv',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'id',
                  fieldId: 'field_ZJ2aPfnDF7',
                  shapeId: 'shape_2mb389jTEL',
                  contributions: {},
                  changes: 'updated',
                  isRemoved: false,
                },
                {
                  name: 'dueDate',
                  fieldId: 'field_eHl286agXw',
                  shapeId: 'shape_PTjiKnpFzQ',
                  contributions: {},
                  changes: 'removed',
                  isRemoved: true,
                },
              ],
            },
          },
        ],
        shape_9GDAmGAINi: [
          {
            shapeId: 'shape_9GDAmGAINi',
            jsonType: 'String',
          },
        ],
        shape_4yRQwm4WOv: [
          {
            shapeId: 'shape_4yRQwm4WOv',
            jsonType: 'Boolean',
          },
        ],
        shape_2mb389jTEL: [
          {
            shapeId: 'shape_2mb389jTEL',
            jsonType: 'String',
          },
        ],
        shape_PTjiKnpFzQ: [
          {
            shapeId: 'shape_PTjiKnpFzQ',
            jsonType: 'String',
          },
        ],
        shape_ToF242uYVA: [
          {
            shapeId: 'shape_ToF242uYVA',
            jsonType: 'Array',
            asArray: {
              shapeId: 'shape_ohd8yFyzEg',
            },
          },
        ],
        shape_ohd8yFyzEg: [
          {
            shapeId: 'shape_ohd8yFyzEg',
            jsonType: 'Object',
            asObject: {
              fields: [
                {
                  name: 'task',
                  fieldId: 'field_7u9pabP6VJ',
                  shapeId: 'shape_CgzMTUdLrP',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'isDone',
                  fieldId: 'field_WAgxB3TCIX',
                  shapeId: 'shape_eDApTnytqu',
                  contributions: {
                    description: 'is the task done',
                  },
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'id',
                  fieldId: 'field_I4kC8vgaOM',
                  shapeId: 'shape_z89HIEeyN0',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'dueDate',
                  fieldId: 'field_TxVlnhtLaa',
                  shapeId: 'shape_3Xt9wp5UxL',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
              ],
            },
          },
        ],
        shape_CgzMTUdLrP: [
          {
            shapeId: 'shape_CgzMTUdLrP',
            jsonType: 'String',
          },
        ],
        shape_eDApTnytqu: [
          {
            shapeId: 'shape_eDApTnytqu',
            jsonType: 'Boolean',
          },
        ],
        shape_z89HIEeyN0: [
          {
            shapeId: 'shape_z89HIEeyN0',
            jsonType: 'String',
          },
        ],
        shape_3Xt9wp5UxL: [
          {
            shapeId: 'shape_3Xt9wp5UxL',
            jsonType: 'String',
          },
        ],
        shape_ZL8uOU2HQF: [
          {
            shapeId: 'shape_ZL8uOU2HQF',
            jsonType: 'String',
          },
        ],
        shape_cEkQAVQ3ib: [
          {
            shapeId: 'shape_cEkQAVQ3ib',
            jsonType: 'Array',
            asArray: {
              shapeId: 'shape_f7gQgQ8p7G',
            },
          },
        ],
        shape_f7gQgQ8p7G: [
          {
            shapeId: 'shape_f7gQgQ8p7G',
            jsonType: 'Object',
            asObject: {
              fields: [
                {
                  name: 'task',
                  fieldId: 'field_LRYtHDYkVO',
                  shapeId: 'shape_tUQxsgursF',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'isDone',
                  fieldId: 'field_XM7KRqWOlV',
                  shapeId: 'shape_9cUoBYpjJU',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'id',
                  fieldId: 'field_9mczOWgNnu',
                  shapeId: 'shape_R4cTQ1zpOs',
                  contributions: {},
                  changes: 'updated',
                  isRemoved: false,
                },
                {
                  name: 'dueDate',
                  fieldId: 'field_5GCvc8KB2p',
                  shapeId: 'shape_owJFnZQJeS',
                  contributions: {},
                  changes: 'removed',
                  isRemoved: true,
                },
              ],
            },
          },
        ],
        shape_tUQxsgursF: [
          {
            shapeId: 'shape_tUQxsgursF',
            jsonType: 'String',
          },
        ],
        shape_9cUoBYpjJU: [
          {
            shapeId: 'shape_9cUoBYpjJU',
            jsonType: 'Boolean',
          },
        ],
        shape_R4cTQ1zpOs: [
          {
            shapeId: 'shape_R4cTQ1zpOs',
            jsonType: 'String',
          },
        ],
        shape_owJFnZQJeS: [
          {
            shapeId: 'shape_owJFnZQJeS',
            jsonType: 'String',
          },
        ],
        shape_0xeeapZ7UZ: [
          {
            shapeId: 'shape_0xeeapZ7UZ',
            jsonType: 'Array',
            asArray: {
              shapeId: 'shape_Fr2jskGj0G',
            },
          },
        ],
        shape_Fr2jskGj0G: [
          {
            shapeId: 'shape_Fr2jskGj0G',
            jsonType: 'Object',
            asObject: {
              fields: [
                {
                  name: 'task',
                  fieldId: 'field_NC2enngiGZ',
                  shapeId: 'shape_iT4Fjb9iYe',
                  contributions: {},
                  changes: null,
                  isRemoved: false,
                },
                {
                  name: 'isDone',
                  fieldId: 'field_PPgOBSHq9D',
                  shapeId: 'shape_a1n10Wzc6O',
                  contributions: {},
                  changes: null,
                  isRemoved: true,
                },
                {
                  name: 'id',
                  fieldId: 'field_yUzK0XALx0',
                  shapeId: 'shape_UmsvoMDzQ8',
                  contributions: {},
                  changes: 'updated',
                  isRemoved: false,
                },
                {
                  name: 'dueDate',
                  fieldId: 'field_cOmYY7RoTV',
                  shapeId: 'shape_FVWIcOgFGF',
                  contributions: {},
                  changes: 'removed',
                  isRemoved: true,
                },
              ],
            },
          },
        ],
        shape_iT4Fjb9iYe: [
          {
            shapeId: 'shape_iT4Fjb9iYe',
            jsonType: 'String',
          },
        ],
        shape_a1n10Wzc6O: [
          {
            shapeId: 'shape_a1n10Wzc6O',
            jsonType: 'Boolean',
          },
        ],
        shape_UmsvoMDzQ8: [
          {
            shapeId: 'shape_UmsvoMDzQ8',
            jsonType: 'String',
          },
        ],
        shape_FVWIcOgFGF: [
          {
            shapeId: 'shape_FVWIcOgFGF',
            jsonType: 'String',
          },
        ],
      },
      changes: {
        field_5GCvc8KB2p: 'removed',
        field_9mczOWgNnu: 'updated',
      },
    },
  } as RootState);
