package com.opticdev.core.sourcegear.serialization

import boopickle.Default._
import boopickle.DefaultBasic.PicklerGenerator
import boopickle.PicklerHelper
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.{Gear, SGConfig}
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.SchemaColdStorage
import com.opticdev.sdk.{BoolProperty, _}
import com.opticdev.sdk.descriptions.enums.LocationEnums.LocationTypeEnums
import com.opticdev.sdk.descriptions.finders.{Finder, NodeFinder, RangeFinder, StringFinder}

object PickleImplicits extends PicklerHelper {

  implicit object RangePickler extends P[Range] {
    @inline override def pickle(value: Range)(implicit state: PickleState) = {
      state.enc.writeInt(value.start)
      state.enc.writeInt(value.end)
    }
    @inline override def unpickle(implicit state: UnpickleState): Range = {
      Range(state.dec.readInt, state.dec.readInt)
    }
  }

  implicit val codeEnumPickler = {
    import com.opticdev.sdk.descriptions.enums.ComponentEnums.{CodeEnum, Literal, Token}
    compositePickler[CodeEnum]
      .addConcreteType[Token.type]
      .addConcreteType[Literal.type]
  }

  implicit val locationTypeEnumPickler = {
    import com.opticdev.sdk.descriptions.enums.LocationEnums._
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
    import com.opticdev.sdk.descriptions.enums.RuleEnums._
    compositePickler[ChildrenRuleTypeEnum]
      .addConcreteType[Any.type]
      .addConcreteType[Exact.type]
      .addConcreteType[SameAnyOrder.type]
      .addConcreteType[SamePlus.type]
      .addConcreteType[SameAnyOrderPlus.type]
  }

  implicit val stringFinderEnumPickler = {
    import com.opticdev.sdk.descriptions.enums.FinderEnums._
    compositePickler[StringEnums]
      .addConcreteType[Entire.type]
      .addConcreteType[Containing.type]
      .addConcreteType[Starting.type]
  }

  implicit val componentPickler = {
    import com.opticdev.sdk.descriptions.{CodeComponent, Component, SchemaComponent}
    compositePickler[Component]
      .addConcreteType[CodeComponent]
      .addConcreteType[SchemaComponent]
  }

  implicit val finderPickler = {
    import com.opticdev.sdk.descriptions.finders.{Finder, NodeFinder, RangeFinder, StringFinder}
    compositePickler[Finder]
      .addConcreteType[StringFinder]
      .addConcreteType[RangeFinder]
      .addConcreteType[NodeFinder]
  }

  import com.opticdev.sdk.{PropertyValue, StringProperty, NumberProperty, BoolProperty, ObjectProperty, ArrayProperty}

  implicit val propertyValuePickler = compositePickler[PropertyValue]
  implicit val objectPropertyValuePickler = PicklerGenerator.generatePickler[ObjectProperty]
  implicit val arrayPropertyValuePickler = PicklerGenerator.generatePickler[ArrayProperty]

  propertyValuePickler
    .addConcreteType[StringProperty]
    .addConcreteType[NumberProperty]
    .addConcreteType[BoolProperty]
    .addConcreteType[ArrayProperty]
    .addConcreteType[ObjectProperty]


  //@todo this should be moved within the parsers
  implicit val ruleProvider = new RuleProvider()

  implicit object GearPickler extends Pickler[Gear] {
    override def pickle(value: Gear)(implicit state: PickleState): Unit = {
      state.pickle(value.identifier)
      state.pickle(value.enterOn)
      state.pickle(value.parser)
      state.pickle(value.generater)
    }
    override def unpickle(implicit state: UnpickleState): Gear = {
      Gear(
        state.unpickle[String],
        state.unpickle[Set[AstType]],
        state.unpickle[ParseAsModel],
        state.unpickle[GenerateGear]
      )
    }
  }

  implicit object SGConfigPickler extends Pickler[SGConfig] {
    override def pickle(value: SGConfig)(implicit state: PickleState): Unit = {
      state.pickle(value.hashInt)
      state.pickle(value.parserIds)
      state.pickle(value.gears)
      state.pickle(value.schemas)
    }
    override def unpickle(implicit state: UnpickleState): SGConfig = {
      SGConfig(
        state.unpickle[Int],
        state.unpickle[Set[String]],
        state.unpickle[Set[Gear]],
        state.unpickle[Set[SchemaColdStorage]]
      )
    }
  }

}
