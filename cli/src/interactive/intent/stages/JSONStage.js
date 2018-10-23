import {StageBase} from "../base/StageBase";
import {contentModesEnum} from "../../constants/ContentModes";
import {resetToMain} from "../../actions/StateMutations";
import {printState, printVisibleElements} from "../../debuggers/commands";
import {DynamicJSONStage} from "./DynamicJSONStage";

export class JSONStage extends DynamicJSONStage {

	constructor({initialValue = {}, schema = {}, onFinish = null}) {
		super(() => {
			return {initialValue, schema, onFinish}
		})
	}

}
