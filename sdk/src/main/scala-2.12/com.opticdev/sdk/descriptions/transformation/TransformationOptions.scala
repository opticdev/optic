package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.JsObject


//Transformation Results
case class StagedNode(schema: SchemaRef,
                      value: JsObject,
                      options: Option[TransformationOptions] = Some(TransformationOptions(None, None, None))) extends TransformationResult

case class SingleModel(value: JsObject) extends TransformationResult


//Transformation Options

case class TransformationOptions(gearId: Option[String],
                                 containers: Option[Map[String, Seq[StagedNode]]],
                                 variables: Option[Map[String, String]])