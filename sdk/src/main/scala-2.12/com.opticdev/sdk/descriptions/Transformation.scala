package com.opticdev.sdk.descriptions

import com.opticdev.common.PackageRef
import play.api.libs.json._


object Transformation extends Description[Transformation] {
  import Schema._

  implicit val transformationReads = Json.reads[Transformation]

  override def fromJson(jsValue: JsValue) = {
    val transformation = Json.fromJson[Transformation](jsValue)

    if (transformation.isSuccess) {
      transformation.get
    } else {
      throw new Error("Transformation Parsing Failed "+transformation)
    }

  }

}

sealed trait TransformationBase extends PackageExportable

//case class InlineTransformation() extends TransformationBase

case class Transformation( inputSchema: SchemaRef,
                           outputSchema: SchemaRef,
                           code: String) extends TransformationBase