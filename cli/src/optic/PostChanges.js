import {ChangeGroup, FileContentsUpdate, InsertModel, RunTransformation} from "./PostChangesInterfaces";
import {agentConnection} from "./AgentSocket";
import {track} from "../Analytics";

export function PostGenerateRequest(schemaRef, value, lensRef, atLocation, editorSlug) {
	const payload = ChangeGroup([InsertModel(schemaRef, lensRef, value, atLocation)])
	track('Post Generate Request', {schemaRef})
	agentConnection().actions.postChanges(payload, editorSlug)
}

export function PostModifyRequest(id, newValue, editorSlug) {
	track('Post Modify Request')
	agentConnection().actions.putUpdate(id, newValue, editorSlug)
}

export function PostGenerateFromRelationshipRequest(transformationRef, inputValue, inputModelId, inputModelName, generatorId, location, answers, editorSlug) {
	const payload = ChangeGroup([RunTransformation(transformationRef, inputValue, inputModelId, inputModelName, generatorId, location, answers)])
	track('Post Generate from Relationship Request', {transformationRef, inputModelName, location})
	agentConnection().actions.postChanges(payload, editorSlug)
}

export function PostSyncChangesRequest({updatedChanges}, editorSlug) {
	track('Post Sync Changes')
	const payload = ChangeGroup(updatedChanges.map(fc => FileContentsUpdate(fc.file, fc.originalFileContents, fc.newFileContents)))
	agentConnection().actions.postChanges(payload, editorSlug)
}
