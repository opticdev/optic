package com.opticdev.sdk.descriptions.transformation.generate

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.TransformationResult
import play.api.libs.json.JsObject

case class SingleModel(schema: SchemaRef, value: JsObject) extends GenerateResult {
  def toStagedNode(newOptions: Option[RenderOptions]) : StagedNode = StagedNode(schema, value, newOptions)
}