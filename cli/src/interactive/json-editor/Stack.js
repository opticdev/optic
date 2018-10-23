import {JSONValueStack} from "./JSONValueStack";
import {JSONObjectStack} from "./JSONObjectStack";
import {JSONArrayStack} from "./JSONArrayStack";

export default {
	forValue: (initialValue, schema, parent) => new JSONValueStack(initialValue, schema, parent),
	forObject: (initialValue, schema, parent) => new JSONObjectStack(initialValue, schema, parent),
	forArray: (initialValue, schema, parent) => new JSONArrayStack(initialValue, schema, parent)
}
