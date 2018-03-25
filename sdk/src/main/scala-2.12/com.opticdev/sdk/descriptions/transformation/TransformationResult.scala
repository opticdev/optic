package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.RenderOptions
import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.JsObject


trait TransformationResult {def toStagedNode(options: Option[RenderOptions] = None) : StagedNode}

case class StagedNode(schema: SchemaRef,
                      value: JsObject,
                      options: Option[RenderOptions] = Some(RenderOptions(None, None, None))) extends TransformationResult {
  def toStagedNode(newOptions: Option[RenderOptions]) : StagedNode = StagedNode(schema, value, {
    if (newOptions.isEmpty && options.isEmpty) None else {
      Some(newOptions.getOrElse(RenderOptions()).mergeWith(options.getOrElse(RenderOptions())))
    }
  })
}

case class SingleModel(schema: SchemaRef, value: JsObject) extends TransformationResult {
  def toStagedNode(newOptions: Option[RenderOptions]) : StagedNode = StagedNode(schema, value, newOptions)
}