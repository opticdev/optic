package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.JsObject


case class StagedNode(schema: SchemaRef,
                      value: JsObject,
                      options: Option[TransformationOptions] = Some(TransformationOptions(None, None, None)))

case class TransformationOptions(gearId: Option[String],
                                 containers: Option[Map[String, Seq[StagedNode]]],
                                 variables: Option[Map[String, String]])