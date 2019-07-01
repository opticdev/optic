import {DataTypesHelper, Primitives, RequestsCommands, RequestsHelper, ShapeCommands} from '../../engine';

export class RequestCommandHelper {

	constructor(handleCommands, requestId) {
		this.handleCommands = handleCommands
		this.requestId = requestId
	}

	getCommandsToCreateString(rootId) {
		const conceptId = DataTypesHelper.newId()
		const defineInlineConcept = ShapeCommands.DefineInlineConcept(rootId, conceptId)
		const assignType = ShapeCommands.AssignType(rootId, Primitives.StringT(), conceptId)
		return {
			conceptId,
			commands: [defineInlineConcept, assignType]
		}
	}

	addBody = () => {
		const {handleCommands, requestId} = this;
		const newConceptId = DataTypesHelper.newId()
		const defineInlineConcept = ShapeCommands.DefineInlineConcept(requestId, newConceptId)
		const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor('application/json', newConceptId, false)
		const setRequestBodyShape = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor)

		handleCommands(defineInlineConcept, setRequestBodyShape)
	}

	addQueryParameter = () => {
		const {handleCommands, requestId} = this;
		const parameterId = RequestsHelper.newId()
		const {conceptId, commands} = this.getCommandsToCreateString(parameterId)
		const name = ''
		const addQueryParameter = RequestsCommands.AddQueryParameter(parameterId, requestId, name)
		const parameterDescriptor = RequestsCommands.ShapedRequestParameterShapeDescriptor(conceptId, false)
		const setQueryParameterShape = RequestsCommands.SetQueryParameterShape(parameterId, parameterDescriptor)
		handleCommands(addQueryParameter, ...commands, setQueryParameterShape)
	}

	addHeaderParameter = () => {
		const {handleCommands, requestId} = this;
		const parameterId = RequestsHelper.newId()
		const {conceptId, commands} = this.getCommandsToCreateString(parameterId)
		const name = ''
		const addHeaderParameter = RequestsCommands.AddHeaderParameter(parameterId, requestId, name)
		const parameterDescriptor = RequestsCommands.ShapedRequestParameterShapeDescriptor(conceptId, false)
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
