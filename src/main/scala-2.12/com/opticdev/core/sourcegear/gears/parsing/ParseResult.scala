package com.opticdev.core.sourcegear.gears.parsing


import com.opticdev.core.sourcegear.graph.ModelNode
import com.opticdev.parsers.graph.AstPrimitiveNode
import play.api.libs.json.{JsObject, JsValue}

case class ParseResult(parseGear: ParseGear, modelNode: ModelNode, astNode: AstPrimitiveNode)

