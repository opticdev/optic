package com.opticdev.sdk.descriptions.transformation.mutate

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.TransformationResult
import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import play.api.libs.json.{JsObject, JsValue, Json}

case class StagedMutation(modelId: String,
                          value: Option[JsObject],
                          options: Option[MutationOptions] = Some(MutationOptions(None, None, None))) extends MutateResult {
  override def toStagedMutation: StagedMutation = this

  override def jsonPreview: JsValue = Json.toJson(this)
}

case class StagedTagMutation(value: Option[JsObject],
                             options: Option[MutationOptions] = Some(MutationOptions(None, None, None))) {

  def toStagedMutation(modelId: String) = StagedMutation(modelId, value, options)

}