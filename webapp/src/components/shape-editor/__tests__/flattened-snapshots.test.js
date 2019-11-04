import { Facade, Queries, ShapesCommands, RfcCommandContext } from '../../../engine';
import { ShapeUtilities } from '../ShapeUtilities.js';

const starterCommands = [
    ShapesCommands.AddShape('$Id', '$identifier', 'ID'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$Id', ShapesCommands.ShapeProvider('$string'), '$identifierInner')),

    ShapesCommands.AddShape('$Account', '$object', 'Account'),
    ShapesCommands.AddShape('$AccountId', '$reference', 'Account ID'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$AccountId', ShapesCommands.ShapeProvider('$Account'), '$referenceInner')),

    ShapesCommands.AddShape('$User', '$object', 'User'),
    ShapesCommands.AddShape('$UserId', '$reference', 'User ID'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$UserId', ShapesCommands.ShapeProvider('$User'), '$referenceInner')),

    ShapesCommands.AddField('$Account.id', '$Account', 'id', ShapesCommands.FieldShapeFromShape('$Account.id', '$AccountId')),
    ShapesCommands.AddField('$Account.userIds', '$Account', 'userIds', ShapesCommands.FieldShapeFromShape('$Account.userIds', '$list')),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInField('$Account.userIds', ShapesCommands.ShapeProvider('$UserId'), '$listItem')),

    ShapesCommands.AddField('$User.id', '$User', 'id', ShapesCommands.FieldShapeFromShape('$User.id', '$string')),
    ShapesCommands.AddField('$User.name', '$User', 'name', ShapesCommands.FieldShapeFromShape('$User.name', '$string')),
    ShapesCommands.AddField('$User.accountId', '$User', 'accountId', ShapesCommands.FieldShapeFromShape('$User.accountId', '$AccountId')),

    ShapesCommands.AddShape('$PaginationWrapper', '$object', 'PaginationWrapper'),
    ShapesCommands.AddShapeParameter('$PaginationWrapper.T', '$PaginationWrapper', 'T'),
    ShapesCommands.AddField('$PaginationWrapper.offset', '$PaginationWrapper', 'offset', ShapesCommands.FieldShapeFromShape('$PaginationWrapper.offset', '$number')),
    ShapesCommands.AddField('$PaginationWrapper.items', '$PaginationWrapper', 'items', ShapesCommands.FieldShapeFromShape('$PaginationWrapper.items', '$list')),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInField('$PaginationWrapper.items', ShapesCommands.ParameterProvider('$PaginationWrapper.T'), '$listItem')),

    ShapesCommands.AddShape('$UserListResponse1', '$PaginationWrapper', 'User List Response 1'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$UserListResponse1', ShapesCommands.ShapeProvider('$User'), '$PaginationWrapper.T')),

    ShapesCommands.AddShape('$UserListResponse2', '$PaginationWrapper', 'User List Response 2'),

    ShapesCommands.AddShape('$UserListResponse3', '$PaginationWrapper', 'User List Response 3'),
    ShapesCommands.AddShapeParameter('$UserListResponse3.X', '$UserListResponse3', 'X'),
    ShapesCommands.AddShapeParameter('$UserListResponse3.Y', '$UserListResponse3', 'Y'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$UserListResponse3', ShapesCommands.ParameterProvider('$UserListResponse3.X'), '$PaginationWrapper.T')),
    ShapesCommands.AddField('$UserListResponse3.item', '$UserListResponse3', 'item', ShapesCommands.FieldShapeFromParameter('$UserListResponse3.item', '$UserListResponse3.Y'))
]

const todoEvents = [
    { "PathComponentAdded": { "name": "todo", "parentPathId": "root", "pathId": "path_ddceX9ubhV" } }
    , { "PathParameterAdded": { "name": "todoId", "parentPathId": "path_ddceX9ubhV", "pathId": "path_z69omkQCeH" } }
    , { "ShapeAdded": { "baseShapeId": "$string", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "shape_W4mBGJW3Ex" } }
    , { "PathParameterShapeSet": { "pathId": "path_z69omkQCeH", "shapeDescriptor": { "isRemoved": false, "shapeId": "shape_W4mBGJW3Ex" } } }
    , { "RequestAdded": { "httpMethod": "PATCH", "pathId": "path_z69omkQCeH", "requestId": "request_ZkPTjQXkYh" } }
    , { "ShapeAdded": { "baseShapeId": "$object", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "9IRsry_0" } }
    , { "ShapeAdded": { "baseShapeId": "$boolean", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "9IRsry_2" } }
    , { "FieldAdded": { "fieldId": "9IRsry_1", "name": "isDone", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "9IRsry_1", "shapeId": "9IRsry_2" } }, "shapeId": "9IRsry_0" } }
    , { "ShapeAdded": { "baseShapeId": "$string", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "9IRsry_4" } }
    , { "FieldAdded": { "fieldId": "9IRsry_3", "name": "task", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "9IRsry_3", "shapeId": "9IRsry_4" } }, "shapeId": "9IRsry_0" } }
    , { "ShapeAdded": { "baseShapeId": "9IRsry_0", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "shape_IrEV2HYW8k" } }
    , { "RequestBodySet": { "bodyDescriptor": { "httpContentType": "application/json", "isRemoved": false, "shapeId": "shape_IrEV2HYW8k" }, "requestId": "request_ZkPTjQXkYh" } }
    , { "ShapeRenamed": { "name": "ToDoUpdateBody", "shapeId": "9IRsry_0" } }
    , { "ResponseAdded": { "httpStatusCode": 200, "requestId": "request_ZkPTjQXkYh", "responseId": "response_IdpJexoAGm" } }
    , { "ShapeAdded": { "baseShapeId": "$object", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "_Todo_0" } }
    , { "ShapeAdded": { "baseShapeId": "$string", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "_Todo_2" } }
    , { "FieldAdded": { "fieldId": "_Todo_1", "name": "id", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "_Todo_1", "shapeId": "_Todo_2" } }, "shapeId": "_Todo_0" } }
    , { "ShapeAdded": { "baseShapeId": "$boolean", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "_Todo_4" } }
    , { "FieldAdded": { "fieldId": "_Todo_3", "name": "isDone", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "_Todo_3", "shapeId": "_Todo_4" } }, "shapeId": "_Todo_0" } }
    , { "ShapeAdded": { "baseShapeId": "$string", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "_Todo_6" } }
    , { "FieldAdded": { "fieldId": "_Todo_5", "name": "task", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "_Todo_5", "shapeId": "_Todo_6" } }, "shapeId": "_Todo_0" } }
    , { "ShapeAdded": { "baseShapeId": "_Todo_0", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "shape_sS9qO1iLdD" } }
    , { "ResponseBodySet": { "bodyDescriptor": { "httpContentType": "application/json; charset=utf-8", "isRemoved": false, "shapeId": "shape_sS9qO1iLdD" }, "responseId": "response_IdpJexoAGm" } }
    , { "ShapeRenamed": { "name": "ToDo", "shapeId": "_Todo_0" } }
    , { "ContributionAdded": { "id": "request_ZkPTjQXkYh", "key": "description", "value": "Update the Todo in the path (todoId)" } }
    , { "PathComponentAdded": { "name": "todos", "parentPathId": "root", "pathId": "path_psf1AdDPdC" } }
    , { "RequestAdded": { "httpMethod": "GET", "pathId": "path_psf1AdDPdC", "requestId": "request_jyqcOCtAdq" } }
    , { "ResponseAdded": { "httpStatusCode": 200, "requestId": "request_jyqcOCtAdq", "responseId": "response_m0cAG6CQAY" } }
    , { "ShapeAdded": { "baseShapeId": "$list", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "rG6Eyi_0" } }
    , { "ShapeParameterShapeSet": { "shapeDescriptor": { "ProviderInShape": { "consumingParameterId": "$listItem", "providerDescriptor": { "ShapeProvider": { "shapeId": "_Todo_0" } }, "shapeId": "rG6Eyi_0" } } } }
    , { "ShapeAdded": { "baseShapeId": "rG6Eyi_0", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "_ResponseBody_0" } }
    , { "ResponseBodySet": { "bodyDescriptor": { "httpContentType": "application/json; charset=utf-8", "isRemoved": false, "shapeId": "_ResponseBody_0" }, "responseId": "response_m0cAG6CQAY" } }
    , { "ContributionAdded": { "id": "request_jyqcOCtAdq", "key": "description", "value": "Get a list of all the todos" } }
    , { "RequestAdded": { "httpMethod": "POST", "pathId": "path_psf1AdDPdC", "requestId": "request_8VF0hXMHz0" } }
    , { "ShapeAdded": { "baseShapeId": "9IRsry_0", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "shape_f4ymchjzZV" } }
    , { "RequestBodySet": { "bodyDescriptor": { "httpContentType": "application/json", "isRemoved": false, "shapeId": "shape_f4ymchjzZV" }, "requestId": "request_8VF0hXMHz0" } }
    , { "ResponseAdded": { "httpStatusCode": 200, "requestId": "request_8VF0hXMHz0", "responseId": "response_Hn5EnUcQOu" } }
    , { "ShapeAdded": { "baseShapeId": "_Todo_0", "name": "", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "shapeId": "shape_oIoNGLkNiX" } }
    , { "ResponseBodySet": { "bodyDescriptor": { "httpContentType": "application/json; charset=utf-8", "isRemoved": false, "shapeId": "shape_oIoNGLkNiX" }, "responseId": "response_Hn5EnUcQOu" } }
    , { "ContributionAdded": { "id": "request_8VF0hXMHz0", "key": "description", "value": "Create a brand spanking new TODO" } }
    , { "FieldAdded": { "fieldId": "field_MGaT9tKpnz", "name": "zipCode", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "field_MGaT9tKpnz", "shapeId": "$number" } }, "shapeId": "_Todo_0" } }
]

describe('flattened shapes', function () {
    const commandContext = new RfcCommandContext('userId', 'sessionId', 'batchId')

    describe('todo example', function () {
        const rfcId = 'test-rfc'
        const eventStore = Facade.makeEventStore();
        eventStore.bulkAdd(rfcId, JSON.stringify(todoEvents));
        const rfcService = Facade.fromJsonCommands(eventStore, rfcId, commandContext, '[]');
        const queries = Queries(eventStore, rfcService, rfcId);
        
        xit('should render ToDo', function () {
            const shapeId = '_Todo_0'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        })
        it('should render ToDo', function () {
            const shapeId = '_ResponseBody_0'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        })
        
    })
    describe('pagination example', function () {
        const rfcId = 'test-rfc'
        const eventStore = Facade.makeEventStore();
        const rfcService = Facade.fromJsonCommands(eventStore, rfcId, commandContext, '[]')
        const queries = Queries(eventStore, rfcService, rfcId);
        rfcService.handleCommands(rfcId, ...starterCommands)

        it('should render $UserListResponse1', function () {
            const shapeId = '$UserListResponse1'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        });
        it('should render $PaginationWrapper', function () {
            const shapeId = '$PaginationWrapper'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        });
        it('should render $Account', function () {
            const shapeId = '$Account'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        });
    });
});