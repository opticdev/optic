package sourcegear.serialization

import boopickle.Default._
import boopickle.DefaultBasic.PicklerGenerator
import sdk.{BoolProperty, _}
import sdk.descriptions.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}
import sdk.descriptions.enums.LocationEnums.LocationTypeEnums

object PickleImplicits {

  implicit val codeEnumPickler = {
    import sdk.descriptions.enums.ComponentEnums.{CodeEnum, Literal, Token}
    compositePickler[CodeEnum]
      .addConcreteType[Token.type]
      .addConcreteType[Literal.type]
  }

  implicit val locationTypeEnumPickler = {
    import sdk.descriptions.enums.LocationEnums._
    compositePickler[LocationTypeEnums]
      .addConcreteType[InSameFile.type]
      .addConcreteType[Anywhere.type]
      .addConcreteType[Sibling.type]
      .addConcreteType[InScope.type]
      .addConcreteType[InParent.type]
      .addConcreteType[ChildOf]
      .addConcreteType[ParentOf]
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

  implicit val componentPickler = {
    import sdk.descriptions.{CodeComponent, Component, SchemaComponent}
    compositePickler[Component]
      .addConcreteType[CodeComponent]
      .addConcreteType[SchemaComponent]
  }

  implicit val finderPickler = {
    import sdk.descriptions.Finders.{Finder, StringFinder, RangeFinder, NodeFinder}
    compositePickler[Finder]
      .addConcreteType[StringFinder]
      .addConcreteType[RangeFinder]
      .addConcreteType[NodeFinder]
  }

  import sdk.{PropertyValue, StringProperty, NumberProperty, BoolProperty, ObjectProperty, ArrayProperty}

  implicit val propertyValuePickler = compositePickler[PropertyValue]
  implicit val objectPropertyValuePickler = PicklerGenerator.generatePickler[ObjectProperty]
  implicit val arrayPropertyValuePickler = PicklerGenerator.generatePickler[ArrayProperty]

  propertyValuePickler
    .addConcreteType[StringProperty]
    .addConcreteType[NumberProperty]
    .addConcreteType[BoolProperty]
    .addConcreteType[ArrayProperty]
    .addConcreteType[ObjectProperty]


}
