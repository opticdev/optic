import {ChangeGroup, FileContentsUpdate, InsertModel, RunTransformation} from "./PostChangesInterfaces";
import {agentConnection} from "./AgentSocket";

export function PostGenerateRequest(schemaRef, value, lensRef, atLocation, editorSlug) {
	const payload = ChangeGroup([InsertModel(schemaRef, lensRef, value, atLocation)])

	agentConnection().actions.postChanges(payload, editorSlug)
}

export function PostModifyRequest(id, newValue, editorSlug) {
	agentConnection().actions.putUpdate(id, newValue, editorSlug)
}

export function PostGenerateFromRelationshipRequest(transformationRef, inputValue, inputModelId, inputModelName, generatorId, location, answers, editorSlug) {
	const payload = ChangeGroup([RunTransformation(transformationRef, inputValue, inputModelId, inputModelName, generatorId, location, answers)])

	agentConnection().actions.postChanges(payload, editorSlug)
}

export function PostSyncChangesRequest({updatedChanges}, editorSlug) {
	const payload = ChangeGroup(updatedChanges.map(fc => FileContentsUpdate(fc.file, fc.originalFileContents, fc.newFileContents)))
	agentConnection().actions.postChanges(payload, editorSlug)
}
