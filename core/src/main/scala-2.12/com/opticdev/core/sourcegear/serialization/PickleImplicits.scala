package com.opticdev.core.sourcegear.serialization

import boopickle.Default._
import boopickle.DefaultBasic.PicklerGenerator
import boopickle.PicklerHelper
import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import com.opticdev.core.sourcegear.accumulate.{AssignmentListener, Listener, MapSchemaListener}
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.rendering.RenderGear
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.serialization.PickleImplicits.SGExportableLensPickler.sgExportablePickler
import com.opticdev.core.sourcegear.{CompiledLens, CompiledMultiNodeLens, SGConfig, SGExportableLens}
import com.opticdev.opm.context.{Leaf, TreeContext}
import com.opticdev.parsers.ParserRef
import com.opticdev.parsers.graph.path.FlatWalkablePath
import com.opticdev.parsers.graph.{AstType, Child}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.{BasicComponentType, Literal, NotSupported, Token}
import com.opticdev.sdk.{BoolProperty, _}
import com.opticdev.sdk.descriptions.enums.LocationEnums.LocationTypeEnums
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.skills_sdk.compilerInputs.subcontainers.{OMContainerBase, OMSubContainer}
import com.opticdev.sdk.skills_sdk.lens._
import com.opticdev.sdk.skills_sdk.schema.{OMSchema, OMSchemaColdStorage}
import org.mozilla.javascript.ast.ArrayLiteral
import play.api.libs.json.{Format, JsObject, JsValue, Json}

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

  implicit object JsValuePickler extends P[JsValue] {
    @inline override def pickle(value: JsValue)(implicit state: PickleState) = {
      state.enc.writeString(value.toString())
    }
    @inline override def unpickle(implicit state: UnpickleState): JsValue = {
      val input = state.dec.readString
      Json.parse(input)
    }
  }

  implicit object JsObjectPickler extends P[JsObject] {
    @inline override def pickle(value: JsObject)(implicit state: PickleState) = {
      state.enc.writeString(value.toString())
    }
    @inline override def unpickle(implicit state: UnpickleState): JsObject = {
      val input = state.dec.readString
      Json.parse(input).as[JsObject]
    }
  }

  implicit object OMSchemaPickler extends P[OMSchema] {
    @inline override def pickle(value: OMSchema)(implicit state: PickleState) = {
      import com.opticdev.sdk.skills_sdk.Serialization.omschemaFormat
      state.enc.writeString(Json.toJson[OMSchema](value).toString())
    }
    @inline override def unpickle(implicit state: UnpickleState): OMSchema = {
      import com.opticdev.sdk.skills_sdk.Serialization.omschemaFormat
      val input = state.dec.readString
      Json.fromJson[OMSchema](Json.parse(input).as[JsObject]).get
    }
  }

//  implicit object OMEitherSchemaPickler extends P[Either[SchemaRef, OMSchema]] {
//    override def pickle(obj: Either[SchemaRef, OMSchema])(implicit state: PickleState): Unit = {
//      import com.opticdev.sdk.opticmarkdown2.Serialization._
//      val jsonString = Json.toJson[Either[SchemaRef, OMSchema]](obj).toString()
//      state.enc.writeString(jsonString)
//    }
//
//    override def unpickle(implicit state: UnpickleState): Either[SchemaRef, OMSchema] = {
//      import com.opticdev.sdk.opticmarkdown2.Serialization._
//      val input = state.dec.readString
//      Json.fromJson[Either[SchemaRef, OMSchema]](Json.parse(input).as[JsObject]).get
//    }
//  }

  implicit val childrenRuleTypeEnumPickler = {
    import com.opticdev.parsers.rules._
    compositePickler[ChildrenRuleTypeEnum]
      .addConcreteType[Any.type]
      .addConcreteType[Exact.type]
      .addConcreteType[SameAnyOrder.type]
      .addConcreteType[SamePlus.type]
      .addConcreteType[SameAnyOrderPlus.type]
  }

  implicit val locationTypeEnumPickler = {
    import com.opticdev.sdk.descriptions.enums.LocationEnums._
    compositePickler[LocationTypeEnums]
      .addConcreteType[InSameFile.type]
      .addConcreteType[Anywhere.type]
      .addConcreteType[Sibling.type]
      .addConcreteType[InScope.type]
      .addConcreteType[InParent.type]
      .addConcreteType[InCurrentLens.type]
      .addConcreteType[InContainer]
      .addConcreteType[ChildOf]
      .addConcreteType[ParentOf]
  }

  implicit val componentPickler = {
    compositePickler[OMLensComponent]
      .addConcreteType[OMLensCodeComponent]
      .addConcreteType[OMLensSchemaComponent]
  }

  implicit val stringFinderEnumPickler = {
    import com.opticdev.sdk.descriptions.enums.FinderEnums._
    compositePickler[StringEnums]
      .addConcreteType[Entire.type]
      .addConcreteType[Containing.type]
      .addConcreteType[Starting.type]
  }

  implicit val basicComponentEnumPickler = {
    import com.opticdev.sdk.descriptions.enums.{BasicComponentType, NotSupported, Token, Literal, ObjectLiteral, ArrayLiteral}
    compositePickler[BasicComponentType]
      .addConcreteType[NotSupported.type]
      .addConcreteType[Token.type]
      .addConcreteType[ObjectLiteral.type]
      .addConcreteType[ArrayLiteral.type]
      .addConcreteType[Literal.type]

  }

  implicit val containerPickler = {
    compositePickler[OMContainerBase]
      .addConcreteType[OMSubContainer]
  }

  implicit val finderPickler = {
    compositePickler[OMFinder]
      .addConcreteType[OMLensNodeFinder]
  }

  implicit val childEdgePickler = PicklerGenerator.generatePickler[Child]
  implicit val flatWalkablePathPickler = PicklerGenerator.generatePickler[FlatWalkablePath]

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

  object ListenerPickler {
    implicit val listenerPickler = compositePickler[Listener]
    listenerPickler.addConcreteType[Listener]
      .addConcreteType[MapSchemaListener]
      .addConcreteType[AssignmentListener]
  }

  import ListenerPickler.listenerPickler

  implicit object ConmpiledLensPickler extends Pickler[CompiledLens] {
    override def pickle(value: CompiledLens)(implicit state: PickleState): Unit = {
      state.pickle(value.name)
      state.pickle(value.id)
      state.pickle(value.packageRef)
      state.pickle(value.schema)
      state.pickle(value.enterOn)
      state.pickle(value.parser)
      state.pickle(value.renderer)
      state.pickle(value.priority)
      state.pickle(value.internal)
    }
    override def unpickle(implicit state: UnpickleState): CompiledLens = {
      CompiledLens(
        state.unpickle[Option[String]],
        state.unpickle[String],
        state.unpickle[PackageRef],
        state.unpickle[Either[SchemaRef, OMSchema]],
        state.unpickle[Set[AstType]],
        state.unpickle[ParseAsModel],
        state.unpickle[RenderGear],
        state.unpickle[Int],
        state.unpickle[Boolean]
      )
    }
  }

  object FlatContextTreePickler {
    implicit val treePickler = compositePickler[SGExportable]
    treePickler.addConcreteType[FlatContext]
      .addConcreteType[OMSchema]
      .addConcreteType[CompiledLens]
  }

  import FlatContextTreePickler.treePickler

  implicit object CompiledMultiLensPickler extends Pickler[CompiledMultiNodeLens] {
    override def pickle(value: CompiledMultiNodeLens)(implicit state: PickleState): Unit = {
      state.pickle(value.name)
      state.pickle(value.id)
      state.pickle(value.packageRef)
      state.pickle(value.schema)
      state.pickle(value.enterOn)
      state.pickle(value.childLenses)
      state.pickle(value.priority)
    }
    override def unpickle(implicit state: UnpickleState): CompiledMultiNodeLens = {
      CompiledMultiNodeLens(
        state.unpickle[Option[String]],
        state.unpickle[String],
        state.unpickle[PackageRef],
        state.unpickle[Either[SchemaRef, OMSchema]],
        state.unpickle[Set[AstType]],
        state.unpickle[ParserRef],
        state.unpickle[Seq[CompiledLens]],
        state.unpickle[Int]
      )
    }
  }

  object SGExportableLensPickler {
    implicit val sgExportablePickler = compositePickler[SGExportableLens]
    sgExportablePickler.addConcreteType[SGExportableLens]
      .addConcreteType[CompiledLens]
      .addConcreteType[CompiledMultiNodeLens]
  }

  import SGExportableLensPickler.sgExportablePickler


  implicit object SGConfigPickler extends Pickler[SGConfig] {
    override def pickle(value: SGConfig)(implicit state: PickleState): Unit = {
      state.pickle(value.hashInt)
      state.pickle(value._flatContext)
      state.pickle(value.parserIds)
      state.pickle(value.compiledLenses)
      state.pickle(value.schemas)
      state.pickle(value.transformations)
      state.pickle(value.connectedProjects)
    }
    override def unpickle(implicit state: UnpickleState): SGConfig = {
      SGConfig(
        state.unpickle[Int],
        state.unpickle[FlatContext],
        state.unpickle[Set[ParserRef]],
        state.unpickle[Set[SGExportableLens]],
        state.unpickle[Set[OMSchemaColdStorage]],
        state.unpickle[Set[Transformation]],
        state.unpickle[Set[String]]
      )
    }
  }

}
