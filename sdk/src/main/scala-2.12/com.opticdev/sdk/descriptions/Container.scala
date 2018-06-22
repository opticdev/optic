//package com.opticdev.sdk.descriptions
//
//import com.opticdev.parsers.rules.ChildrenRuleTypeEnum
//import com.opticdev.sdk.descriptions.enums.NotSupported
//import com.opticdev.sdk.descriptions.enums.RuleEnums.childrenRuleReads
//import com.opticdev.sdk.descriptions.finders.Finder
//import play.api.libs.json._
//
//sealed trait ContainerBase {
//  val pulls: Vector[String]
//  val childrenRule : ChildrenRuleTypeEnum
//  val schemaComponents: Vector[SchemaComponent]
//}
//
//
//object ContainerBase extends Description[ContainerBase] {
//
//  import Component.schemaComponentReads
//
//  implicit val containerReads: Reads[Container] = Json.reads[Container]
//  implicit val subcontainerReads: Reads[SubContainer] = Json.reads[SubContainer]
//
//  override def fromJson(jsValue: JsValue) = {
//    val componentType = (jsValue \ "subcontainer").getOrElse(JsBoolean(false))
//
//      val result : JsResult[ContainerBase] = componentType.as[JsBoolean].value match {
//        case true => Json.fromJson[SubContainer](jsValue)
//        case false => Json.fromJson[Container](jsValue)
//      }
//
//    result.get
//  }
//}
//
//
//case class Container(name: String,
//                     snippet: Snippet,
//                     pulls: Vector[String],
//                     childrenRule: ChildrenRuleTypeEnum,
//                     schemaComponents: Vector[SchemaComponent]) extends ContainerBase
//
//case class SubContainer(name: String,
//                        pulls: Vector[String],
//                        childrenRule: ChildrenRuleTypeEnum,
//                        schemaComponents: Vector[SchemaComponent]) extends ContainerBase
