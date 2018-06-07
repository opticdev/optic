package com.opticdev

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate._
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

  implicit lazy val variableMappingFormat = new Format[VariableMapping] {
    override def writes(o: VariableMapping): JsValue =
      JsObject(o.toSeq.map(i=> i._1 -> JsString(i._2)))

    override def reads(json: JsValue): JsResult[VariableMapping] = {
      JsSuccess(json.as[JsObject].value.mapValues(_.as[JsString].value).toMap)
    }
  }

  implicit lazy val stagedNodeFormat: Format[StagedNode] = (
    (__ \ 'schema).format[SchemaRef] and
      (__ \ 'value).format[JsObject] and
      (__ \ 'options).lazyFormatNullable(implicitly[Format[RenderOptions]])
    )(StagedNode.apply, unlift(StagedNode.unapply))



  implicit lazy val containerMutationOperationsOptions = Json.format[ContainerMutationOperation]
  implicit lazy val stagedContainerMutation = Json.format[StagedContainerMutation]
  implicit lazy val stagedTagMutation = Json.format[StagedTagMutation]

  implicit lazy val mutationOptionsFormat: Format[MutationOptions] = (
      (__ \ 'tags).lazyFormatNullable(implicitly[Format[TagMutations]]) and
      (__ \ 'containers).lazyFormatNullable(implicitly[Format[ContainerMutations]]) and
      (__ \ 'variables).lazyFormatNullable(implicitly[Format[VariableMapping]])
    )(MutationOptions.apply, unlift(MutationOptions.unapply))

  implicit lazy val stagedMutationFormat: Format[StagedMutation] = (
    (__ \ 'modelId).format[String] and
      (__ \ 'value).formatNullable[JsObject] and
      (__ \ 'options).lazyFormatNullable(implicitly[Format[MutationOptions]])
    )(StagedMutation.apply, unlift(StagedMutation.unapply))

}
