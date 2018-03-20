package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.JsObject


//Transformation Results
case class StagedNode(schema: SchemaRef,
                      value: JsObject,
                      options: Option[TransformationOptions] = Some(TransformationOptions(None, None, None))) extends TransformationResult

case class SingleModel(schema: SchemaRef, value: JsObject) extends TransformationResult


//Transformation Options

case class TransformationOptions(gearId: Option[String] = None,
                                 containers: Option[ContainersContent] = None,
                                 variables: Option[VariableMapping] = None)