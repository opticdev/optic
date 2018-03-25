package com.opticdev

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.StagedNode
import play.api.libs.functional.syntax.unlift
import play.api.libs.json.{Format, JsObject, Json, __}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Reads._

package object sdk {
  type ContainersContent = Map[String, Seq[StagedNode]]
  type VariableMapping = Map[String, String]

  //SDK Objects refs
  import PackageRef.packageRefJsonFormat
  import SchemaRef.schemaRefFormats

  implicit lazy val renderOptionsFormat = Json.format[RenderOptions]

  implicit lazy val stagedNodeFormat: Format[StagedNode] = (
    (__ \ 'schema).format[SchemaRef] and
      (__ \ 'value).format[JsObject] and
      (__ \ 'options).lazyFormatNullable(implicitly[Format[RenderOptions]])
    )(StagedNode.apply, unlift(StagedNode.unapply))

}
