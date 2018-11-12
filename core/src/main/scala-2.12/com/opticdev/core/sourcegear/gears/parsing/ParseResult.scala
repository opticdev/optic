package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.common.graph.{CommonAstNode, WithinFile}
import play.api.libs.json.{JsObject, JsValue}

case class ParseResult[N <: WithinFile](parseGear: ParseGear, modelNode: LinkedModelNode[N], astNode: N)

