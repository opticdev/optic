package com.opticdev.core.sourcegear.serialization

import boopickle.Default._
import boopickle.DefaultBasic.PicklerGenerator
import com.opticdev.core.sdk.{BoolProperty, _}
import com.opticdev.core.sdk.descriptions.enums.LocationEnums.LocationTypeEnums

object PickleImplicits {

  implicit val codeEnumPickler = {
    import com.opticdev.core.sdk.descriptions.enums.ComponentEnums.{CodeEnum, Literal, Token}
    compositePickler[CodeEnum]
      .addConcreteType[Token.type]
      .addConcreteType[Literal.type]
  }

  implicit val locationTypeEnumPickler = {
    import com.opticdev.core.sdk.descriptions.enums.LocationEnums._
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
    import com.opticdev.core.sdk.descriptions.enums.RuleEnums._
    compositePickler[ChildrenRuleTypeEnum]
      .addConcreteType[Any.type]
      .addConcreteType[Exact.type]
      .addConcreteType[SameAnyOrder.type]
      .addConcreteType[SamePlus.type]
      .addConcreteType[SameAnyOrderPlus.type]
  }

  implicit val stringFinderEnumPickler = {
    import com.opticdev.core.sdk.descriptions.enums.FinderEnums._
    compositePickler[StringEnums]
      .addConcreteType[Entire.type]
      .addConcreteType[Containing.type]
      .addConcreteType[Starting.type]
  }

  implicit val componentPickler = {
    import com.opticdev.core.sdk.descriptions.{CodeComponent, Component, SchemaComponent}
    compositePickler[Component]
      .addConcreteType[CodeComponent]
      .addConcreteType[SchemaComponent]
  }

  implicit val finderPickler = {
    import com.opticdev.core.sdk.descriptions.enums.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}
    compositePickler[Finder]
      .addConcreteType[StringFinder]
      .addConcreteType[RangeFinder]
      .addConcreteType[NodeFinder]
  }

  import com.opticdev.core.sdk.{PropertyValue, StringProperty, NumberProperty, BoolProperty, ObjectProperty, ArrayProperty}

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
