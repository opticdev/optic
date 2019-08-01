import {Facade, Queries, ShapesCommands} from '../../../engine';
import {ShapeUtilities} from '../ShapeUtilities.js';

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

describe('flattened shapes', function () {
    describe('pagination example', function () {
        const rfcId = 'test-rfc'
        const eventStore = Facade.makeEventStore();
        const rfcService = Facade.fromJsonCommands(eventStore, '[]', rfcId)
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