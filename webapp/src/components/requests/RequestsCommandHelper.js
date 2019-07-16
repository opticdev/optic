import {ShapesHelper, RequestsCommands, RequestsHelper, ShapesCommands} from '../../engine';

export class RequestsCommandHelper {

    constructor(handleCommands, requestId) {
        this.handleCommands = handleCommands
        this.requestId = requestId
    }

    getCommandsToCreateString() {
        const shapeId = ShapesHelper.newShapeId()
        const addShape = ShapesCommands.AddShape(shapeId, '$string', '')
        return {
            shapeId,
            commands: [addShape]
        }
    }

    addBody = () => {
        const {handleCommands, requestId} = this;
        const shapeId = ShapesHelper.newShapeId()
        const addShape = ShapesCommands.AddShape(requestId, shapeId, '')
        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor('application/json', shapeId, false)
        const setRequestBodyShape = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor)

        handleCommands(addShape, setRequestBodyShape)
    }

    addQueryParameter = () => {
        const {handleCommands, requestId} = this;
        const parameterId = RequestsHelper.newId()
        const {shapeId, commands} = this.getCommandsToCreateString()
        const name = ''
        const addQueryParameter = RequestsCommands.AddQueryParameter(parameterId, requestId, name)
        const parameterDescriptor = RequestsCommands.ShapedRequestParameterShapeDescriptor(shapeId, false)
        const setQueryParameterShape = RequestsCommands.SetQueryParameterShape(parameterId, parameterDescriptor)
        handleCommands(addQueryParameter, ...commands, setQueryParameterShape)
    }

    addHeaderParameter = () => {
        const {handleCommands, requestId} = this;
        const parameterId = RequestsHelper.newId()
        const {shapeId, commands} = this.getCommandsToCreateString()
        const name = ''
        const addHeaderParameter = RequestsCommands.AddHeaderParameter(parameterId, requestId, name)
        const parameterDescriptor = RequestsCommands.ShapedRequestParameterShapeDescriptor(shapeId, false)
        const setHeaderParameterShape = RequestsCommands.SetHeaderParameterShape(parameterId, parameterDescriptor)
        handleCommands(addHeaderParameter, ...commands, setHeaderParameterShape)
    }

    addResponse = () => {

        const {handleCommands, requestId} = this;
        const responseId = RequestsHelper.newId()
        const statusCode = 200
        const addResponse = RequestsCommands.AddResponse(responseId, requestId, statusCode)

        handleCommands(addResponse)
    }


}
