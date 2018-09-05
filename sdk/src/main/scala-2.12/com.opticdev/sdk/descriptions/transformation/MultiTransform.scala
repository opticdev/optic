package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.transformation.generate.GenerateResult
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import play.api.libs.json.{JsArray, JsObject, JsValue}

case class MultiTransform(transforms: Seq[TransformationResult]) extends TransformationResult {
  override def jsonPreview: JsArray = JsArray(transforms.map(_.jsonPreview))
}
