package com.opticdev.sdk.descriptions

import com.opticdev.common.PackageRef
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Reads._

package object transformation {

  trait TransformationResult
  type ContainersContent = Map[String, Seq[StagedNode]]
  type VariableMapping = Map[String, String]

  //SDK Objects refs
  import PackageRef.packageRefJsonFormat
  import SchemaRef.schemaRefFormats

  implicit val transformationOptionsFormat = Json.format[TransformationOptions]

  implicit val stagedNodeFormat: Format[StagedNode] = (
      (__ \ 'schema).format[SchemaRef] and
      (__ \ 'value).format[JsObject] and
      (__ \ 'options).lazyFormatNullable(implicitly[Format[TransformationOptions]])
    )(StagedNode.apply, unlift(StagedNode.unapply))


}
