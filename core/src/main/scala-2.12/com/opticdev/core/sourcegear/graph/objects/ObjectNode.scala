package com.opticdev.core.sourcegear.graph.objects

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.graph.AstProjection
import com.opticdev.parsers.graph.BaseNode
import play.api.libs.json.JsObject

case class ObjectNode(name: String, schemaRef: SchemaRef, value: JsObject) extends AstProjection