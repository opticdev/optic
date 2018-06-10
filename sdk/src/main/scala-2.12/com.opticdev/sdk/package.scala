package com.opticdev

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.{MultiTransform, ProcessResult, TransformationResult}
import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate.ContainerMutationOperationsEnum
import com.opticdev.sdk.descriptions.transformation.mutate.ContainerMutationOperationsEnum.Append
import com.opticdev.sdk.descriptions.transformation.mutate._
import play.api.libs.functional.syntax.unlift
import play.api.libs.json.{Format, JsObject, Json, __}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Reads._
import sun.invoke.empty.Empty

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



  //container mutation operations
  implicit lazy val appendOperationFormat = Json.format[ContainerMutationOperationsEnum.Append]
  implicit lazy val prependOperationFormat = Json.format[ContainerMutationOperationsEnum.Prepend]
  implicit lazy val replaceWithOperationFormat = Json.format[ContainerMutationOperationsEnum.ReplaceWith]
  implicit lazy val insertAtOperationFormat = Json.format[ContainerMutationOperationsEnum.InsertAt]
  implicit lazy val emptyOperationFormat = new Format[ContainerMutationOperationsEnum.Empty] {
    override def reads(json: JsValue): JsResult[ContainerMutationOperationsEnum.Empty] = JsSuccess(ContainerMutationOperationsEnum.Empty())
    override def writes(o: ContainerMutationOperationsEnum.Empty): JsValue = JsObject.empty
  }

  implicit lazy val containerMutationOperationsOptions = new Format[ContainerMutationOperation] {
    override def reads(json: JsValue): JsResult[ContainerMutationOperation] = {
      (json.as[JsObject] \ "type").as[JsString].value match {
        case "append" => Json.fromJson[ContainerMutationOperationsEnum.Append](json)
        case "prepend" => Json.fromJson[ContainerMutationOperationsEnum.Prepend](json)
        case "replace-with" => Json.fromJson[ContainerMutationOperationsEnum.ReplaceWith](json)
        case "insert-at" => Json.fromJson[ContainerMutationOperationsEnum.InsertAt](json)
        case "empty" => Json.fromJson[ContainerMutationOperationsEnum.Empty](json)
      }
    }
    override def writes(o: ContainerMutationOperation): JsValue = o match {
      case i: ContainerMutationOperationsEnum.Append => Json.toJson(i).as[JsObject] + ("type" -> JsString("append"))
      case i: ContainerMutationOperationsEnum.Prepend => Json.toJson(i).as[JsObject] + ("type" -> JsString("prepend"))
      case i: ContainerMutationOperationsEnum.ReplaceWith => Json.toJson(i).as[JsObject] + ("type" -> JsString("replace-with"))
      case i: ContainerMutationOperationsEnum.InsertAt => Json.toJson(i).as[JsObject] + ("type" -> JsString("insert-at"))
      case i: ContainerMutationOperationsEnum.Empty => Json.toJson(i).as[JsObject] + ("type" -> JsString("empty"))
    }
  }



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
