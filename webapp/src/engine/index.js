import * as scalajs from 'seamless-domain'

export const ShapesCommands = scalajs.com.seamless.contexts.shapes.Commands
export const ShapesHelper = scalajs.com.seamless.contexts.shapes.ShapesHelper()
export const RequestsHelper = scalajs.com.seamless.contexts.requests.RequestsServiceHelper()
export const ContentTypesHelper = scalajs.com.seamless.contexts.requests.ContentTypes()

export const RfcCommands = scalajs.com.seamless.contexts.rfc.Commands
export const RequestsCommands = scalajs.com.seamless.contexts.requests.Commands

export const Facade = scalajs.com.seamless.contexts.rfc.RfcServiceJSFacade()
export const Queries = (eventStore, service, aggregateId) => new scalajs.com.seamless.contexts.rfc.Queries(eventStore, service, aggregateId)
export const starterCommands = [
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

const commandsAsJson = starterCommands.map(x => scalajs.CommandSerialization.toJsonString(x))
console.log(commandsAsJson)

