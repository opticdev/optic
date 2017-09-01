package sourcegear.serialization

import boopickle.Default._
import boopickle.DefaultBasic.PicklerGenerator

import sdk.descriptions.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}

object PickleImplicits {

  implicit val codeEnumPickler = {
    import sdk.descriptions.enums.ComponentEnums.{CodeEnum, Literal, Token}
    compositePickler[CodeEnum]
      .addConcreteType[Token.type]
      .addConcreteType[Literal.type]
  }

  implicit val childrenRuleTypeEnumPickler = {
    import sdk.descriptions.enums.RuleEnums._
    compositePickler[ChildrenRuleTypeEnum]
      .addConcreteType[Any.type]
      .addConcreteType[Exact.type]
      .addConcreteType[SameAnyOrder.type]
      .addConcreteType[SamePlus.type]
      .addConcreteType[SameAnyOrderPlus.type]
  }

  implicit val stringFinderEnumPickler = {
    import sdk.descriptions.enums.FinderEnums._
    compositePickler[StringEnums]
      .addConcreteType[Entire.type]
      .addConcreteType[Containing.type]
      .addConcreteType[Starting.type]
  }

  implicit val finderPickler = {
    import sdk.descriptions.Finders.{Finder, StringFinder, RangeFinder, NodeFinder}
    compositePickler[Finder]
      .addConcreteType[StringFinder]
      .addConcreteType[RangeFinder]
      .addConcreteType[NodeFinder]
  }

//  implicit val componentPickler = {
//    import sdk.descriptions.{Component, CodeComponent, SchemaComponent}
//    compositePickler[Component]
//      .addConcreteType[CodeComponent]
//      .addConcreteType[SchemaComponent]
//  }


  implicit val jsBooleanPickler = {
    import play.api.libs.json.{JsBoolean, JsFalse, JsTrue}
    compositePickler[JsBoolean]
      .addConcreteType[JsFalse.type]
      .addConcreteType[JsTrue.type]
  }

}
