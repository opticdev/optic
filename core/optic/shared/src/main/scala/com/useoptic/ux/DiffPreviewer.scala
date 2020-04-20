package com.useoptic.ux

import com.useoptic.contexts.rfc.{Events, RfcCommandContext, RfcService, RfcState}
import com.useoptic.contexts.shapes.Commands.{DynamicParameterList, FieldId, ShapeId}
import com.useoptic.contexts.shapes.{FlattenedField, ShapeEntity, ShapesHelper}
import com.useoptic.contexts.shapes.ShapesHelper.{AnyKind, BooleanKind, ListKind, NullableKind, NumberKind, ObjectKind, OneOfKind, OptionalKind, StringKind, UnknownKind}
import com.useoptic.ddd.InMemoryEventStore
import com.useoptic.diff.DiffResult
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.BodyUtilities
import com.useoptic.diff.interactions.interpreters.DiffDescription
import com.useoptic.diff.shapes.{ArrayVisitor, GenericWrapperVisitor, JsonLikeTraverser, JsonLikeVisitors, JsonTrail, ListItemTrail, ListShapeVisitor, ObjectFieldTrail, ObjectShapeVisitor, ObjectVisitor, OneOfVisitor, PrimitiveShapeVisitor, PrimitiveVisitor, Resolvers, ShapeDiffResult, ShapeTrail, ShapeTraverser, ShapeVisitors, UnmatchedShape}
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.diff.shapes.Resolvers.{ParameterBindings, ResolvedTrail}
import com.useoptic.dsa.SequentialIdGenerator
import com.useoptic.logging.Logger
import com.useoptic.types.capture.{Body, JsonLike}
import com.useoptic.ux.ExampleRenderInterfaces.{ExampleArray, ExampleItem, ExampleObject, ExamplePrimitive, ExampleRenderVisitorHelper, KnownExampleField, MissingExampleField, UnexpectedExampleField}
import com.useoptic.ux.ShapeRenderInterfaces.{SpecArray, SpecField, SpecObject, SpecOneOf, SpecPrimitive, SpecRenderVisitorHelper, WrappedType}
import io.circe.{Json, JsonObject}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Try

@JSExport
@JSExportAll
object DiffPreviewer {

  def previewDiff(jsonLike: Option[JsonLike], spec: RfcState, shapeIdOption: Option[ShapeId], diffs: Set[ShapeDiffResult]): SideBySideRenderHelper = {
    import com.useoptic.diff.shapes.JsonLikeTraverser

    //    val shapeRenderVisitor = new ShapeRenderVisitor(spec)
    //first traverse the example
    val exampleRenderVisitor = new ExampleRenderVisitor(spec, diffs)
    val jsonLikeTraverser = new JsonLikeTraverser(spec, exampleRenderVisitor)
    jsonLikeTraverser.traverse(jsonLike, JsonTrail(Seq.empty), shapeIdOption.map(i => ShapeTrail(i, Seq.empty)))

    //second traversal of spec with examples
    val shapeRenderVisitor = new ShapeRenderVisitor(spec, diffs)
    val specTraverser = new ShapeTraverser(spec, shapeRenderVisitor)
    shapeIdOption.foreach(shapeId => specTraverser.traverse(shapeId, ShapeTrail(shapeId, Seq())))


    new SideBySideRenderHelper(
      exampleRenderVisitor.shapes,
      exampleRenderVisitor.fields,
      exampleRenderVisitor.items,
      shapeRenderVisitor.shapes,
      exampleRenderVisitor.rootShape.exampleId
    )
  }


  def previewShape(spec: RfcState, shapeIdOption: Option[ShapeId]): Option[ShapeOnlyRenderHelper] = shapeIdOption map { shapeId =>
    val shapeRenderVisitor = new ShapeRenderVisitor(spec, Set.empty)
    val specTraverser = new ShapeTraverser(spec, shapeRenderVisitor)
    specTraverser.traverse(shapeId, ShapeTrail(shapeId, Seq()))
    new ShapeOnlyRenderHelper(shapeRenderVisitor.shapes, shapeRenderVisitor.rootShape.specShapeId)
  }

  def previewBody(body: Body): Option[SideBySideRenderHelper] = {
    val parsedOption = BodyUtilities.parseBody(body)
    if (parsedOption.isDefined) {
      Some(previewDiff(parsedOption , RfcState.empty, None, Set.empty))
    } else None
  }

  def shapeOnlyFromShapeBuilder(jsonLike: Option[JsonLike]): Option[ShapeOnlyRenderHelper] = jsonLike flatMap { json =>
    val shapeBuilder = new ShapeBuilder(json)
    val result = shapeBuilder.run

    val commands = result.commands
    val shapeId = result.rootShapeId

    val simulatedId = "simulated"
    val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
    val service = new RfcService(new InMemoryEventStore[Events.RfcEvent])
    commands.foreach(command => {
      val result = Try(service.handleCommand(simulatedId, command, commandContext))
      if (result.isFailure) {
        Logger.log(command)
        //        Logger.log(result)
        throw result.failed.get
      }
    })

    val rfcState = service.currentState(simulatedId)
    previewShape(rfcState, Some(shapeId))
  }

}

class ExampleRenderVisitor(spec: RfcState, diffs: Set[ShapeDiffResult]) extends JsonLikeVisitors with ExampleRenderVisitorHelper {

  def diffsByTrail(bodyTrail: JsonTrail): Set[DiffResult] = {
    diffs.collect {
      case sd: ShapeDiffResult if sd.jsonTrail == bodyTrail => sd
    }
  }

  override val objectVisitor: ObjectVisitor = new ObjectVisitor {
    override def begin(value: Map[String, JsonLike], bodyTrail: JsonTrail, expected: ResolvedTrail, shapeTrail: ShapeTrail): Unit = {

      def idFromName(name: String) = bodyTrail.withChild(JsonObjectKey(name)).toString

      val fieldNameToId = expected.shapeEntity.descriptor.fieldOrdering
        .map(fieldId => {
          val field = spec.shapesState.fields(fieldId)
          val fieldShape = Resolvers.resolveFieldToShape(spec.shapesState, fieldId, expected.bindings).flatMap(x => {
            Some(x.shapeEntity)
          }).get
          (field.descriptor.name -> (idFromName(field.descriptor.name), field, fieldShape))
        }).toMap

      val knownFieldsIds = fieldNameToId.values.map(_._1)

      val missingFieldIds = fieldNameToId.flatMap(entry => {
        val (fieldName, (fieldId, field, fieldShape)) = entry
        val fieldTrail = bodyTrail.withChild(JsonObjectKey(fieldName))
        if (!value.contains(fieldName)) {

          pushField(
            MissingExampleField(fieldTrail.toString, fieldName, fieldId, fieldShape.shapeId, diffs = diffsByTrail(fieldTrail))
          )

          Some(fieldId)
        } else None
      })

      val extraFieldIds = value.flatMap { case (key, value) => {
        if (!fieldNameToId.contains(key)) {
          Logger.log(s"object has extra field ${key}")
          val fieldTrail = bodyTrail.withChild(JsonObjectKey(key))
          val extraFieldId = fieldTrail.toString

          pushField(
            UnexpectedExampleField(fieldTrail.toString, key, value.asJson, diffs = diffsByTrail(fieldTrail))
          )

          Some(extraFieldId)
        } else None
      }
      }


      pushShape(ExampleObject(
        bodyTrail.toString,
        Some(expected.shapeEntity.shapeId),
        knownFieldsIds.toSeq,
        missingFieldIds.toSeq,
        extraFieldIds.toSeq,
        diffs = diffsByTrail(bodyTrail)
      ))

    }

    override def beginUnknown(value: Map[String, JsonLike], bodyTrail: JsonTrail): Unit = {
      val objectId = bodyTrail.toString

      val fieldIds = value.map { case (key, value) => {
        val fieldTrail = bodyTrail.withChild(JsonObjectKey(key))
        val fieldId = fieldTrail.toString
        pushField(UnexpectedExampleField(fieldId, key, value.asJson, Set.empty))
        fieldId
      }
      }.toSeq

      pushShape(
        ExampleObject(
          objectId,
          None,
          Seq.empty,
          Seq.empty,
          unexpectedFieldIds = fieldIds,
          Set.empty
        )
      )
    }

    override def visit(key: String, jsonLike: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail], parentBindings: ParameterBindings): Unit = {
      //only map known fields here
      if (trail.isDefined) {
        val fieldEntity = trail.get.lastField().flatMap(i => spec.shapesState.fields.get(i)).get
        val fieldShape = Resolvers.resolveFieldToShape(spec.shapesState, fieldEntity.fieldId, parentBindings)
        pushField(KnownExampleField(
          bodyTrail.toString,
          key,
          fieldEntity.fieldId,
          fieldShape.get.shapeEntity.shapeId,
          jsonLike.asJson,
          diffs = diffsByTrail(bodyTrail.withChild(JsonObjectKey(key)))
        ))
      }
    }

    override def end(): Unit = {}
  }
  override val arrayVisitor: ArrayVisitor = new ArrayVisitor {

    override def beginUnknown(value: Vector[JsonLike], bodyTrail: JsonTrail): Unit = {
      val arrayId = bodyTrail.toString
      val ids = value.zipWithIndex.map {
        case (i, index) => {
          val id = bodyTrail.withChild(JsonArrayItem(index)).toString
          pushItem(ExampleItem(
            id,
            index.intValue(),
            i.asJson,
            Set.empty
          ))
          id
        }
      }

      pushShape(ExampleArray(
        arrayId,
        None,
        None,
        ids,
        Set.empty
      ))
    }

    override def begin(value: Vector[JsonLike], bodyTrail: JsonTrail, shapeTrail: ShapeTrail, resolvedShapeTrail: ResolvedTrail): Unit = {


      val listShapeId = resolvedShapeTrail.shapeEntity.shapeId
      val resolvedListItem = Resolvers.resolveParameterToShape(spec.shapesState, listShapeId, ListKind.innerParam, resolvedShapeTrail.bindings)

      val ids = value.zipWithIndex.map {
        case (i, index) => bodyTrail.withChild(JsonArrayItem(index)).toString
      }

      pushShape(ExampleArray(
        bodyTrail.toString,
        Some(resolvedShapeTrail.shapeEntity.shapeId),
        resolvedListItem.map(_.shapeId),
        ids,
        diffs = diffsByTrail(bodyTrail)
      ))
    }

    override def visit(index: Number, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      pushItem(ExampleItem(
        bodyTrail.toString,
        index.intValue(),
        value.asJson,
        diffs = diffsByTrail(bodyTrail)
      ))
    }

    override def end(): Unit = {}
  }
  override val primitiveVisitor: PrimitiveVisitor = new PrimitiveVisitor {
    override def visit(value: Option[JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      val resolvedTrailOption = Try(Resolvers.resolveTrailToCoreShape(spec, trail.get)).toOption
      if (value.isDefined) {
        if (resolvedTrailOption.isDefined) {
          val shape = resolvedTrailOption.get.shapeEntity
          val baseShapeId = resolvedTrailOption.get.coreShapeKind.baseShapeId

          pushShape(ExamplePrimitive(
            bodyTrail.toString,
            baseShapeId,
            Some(shape.shapeId),
            value.get.asJson,
            diffs = diffsByTrail(bodyTrail)
          ))
        }
      }
    }

    override def visitUnknown(value: Option[JsonLike], bodyTrail: JsonTrail): Unit = {
      if (value.isDefined) {
        val baseShapeId = Resolvers.jsonToCoreKind(value.get).baseShapeId
        pushShape(ExamplePrimitive(
          bodyTrail.toString,
          baseShapeId,
          None,
          value.get.asJson,
          diffs = diffsByTrail(bodyTrail)
        ))
      }
    }
  }
}

class ShapeRenderVisitor(spec: RfcState, diffs: Set[ShapeDiffResult]) extends ShapeVisitors with SpecRenderVisitorHelper {

  def diffsByTrail(shapeTrail: ShapeTrail): Set[DiffResult] = {
    diffs.collect {
      case sd: ShapeDiffResult if sd.shapeTrail == shapeTrail => sd
    }
  }


  override val objectVisitor: ObjectShapeVisitor = new ObjectShapeVisitor {
    override def begin(objectResolved: ResolvedTrail, shapeTrail: ShapeTrail, exampleJson: Option[JsonLike]): Unit = {

      val expectedFields = objectResolved.shapeEntity.descriptor.fieldOrdering.flatMap(fieldId => {
        val field = spec.shapesState.fields(fieldId)
        if (field.isRemoved) {
          None
        } else {
          //@GOTCHA need field bindings?
          val fieldShape = Resolvers.resolveFieldToShape(spec.shapesState, fieldId, objectResolved.bindings).get
          Some(
            SpecField(field.descriptor.name, field.fieldId, fieldShape.shapeEntity.shapeId,
              diffsByTrail(
              shapeTrail.withChild(ObjectFieldTrail(field.fieldId, fieldShape.shapeEntity.shapeId))
            ))
          )
        }
      })

      pushShape(
        SpecObject(
          objectResolved.shapeEntity.shapeId,
          expectedFields,
          diffsByTrail(shapeTrail)
        )
      )

    }

    override def visit(key: String, fieldId: FieldId, fieldShapeTrail: ResolvedTrail, fieldTrail: ShapeTrail): Unit = {
//      val example = exampleFields.get(fieldId).flatMap(_.exampleValue)
//      pushField(RenderField(
//        fieldId,
//        None,
//        key,
//        Some(fieldShapeTrail.shapeEntity.shapeId),
//        example,
//        diffs = diffsByTrail(fieldTrail)
//      ))
    }

    override def end(): Unit = ???

  }
  override val listVisitor: ListShapeVisitor = new ListShapeVisitor {

    override def begin(shapeTrail: ShapeTrail, listShape: ShapeEntity, itemShape: ShapeEntity): Unit = {

      val baseItem = Resolvers.resolveToBaseShape(itemShape.shapeId)(spec.shapesState)


      pushShape(
        SpecArray(
          listShape.shapeId,
          itemShape.shapeId,
          RenderName(Seq(NameComponent("List of ", ListKind.color, inner = Some(baseItem.shapeId), link = Some(baseItem.shapeId)))),
          diffsByTrail(shapeTrail.withChild(ListItemTrail(listShape.shapeId, itemShape.shapeId)))
        )
      )
    }

    override def end(): Unit = ???


    override def visit(): Unit = ???
  }
  override val primitiveVisitor: PrimitiveShapeVisitor = new PrimitiveShapeVisitor {
    override def visit(objectResolved: ResolvedTrail, shapeTrail: ShapeTrail): Unit = {

      val name = {
        objectResolved.coreShapeKind match {
          case ShapesHelper.AnyKind => RenderName(Seq(NameComponent(AnyKind.name, AnyKind.color)))
          case ShapesHelper.StringKind => RenderName(Seq(NameComponent(StringKind.name, StringKind.color)))
          case ShapesHelper.NumberKind => RenderName(Seq(NameComponent(NumberKind.name, NumberKind.color)))
          case ShapesHelper.BooleanKind => RenderName(Seq(NameComponent(BooleanKind.name, BooleanKind.color)))
          case _ => RenderName(Seq.empty)
        }
      }

      pushShape(SpecPrimitive(
        objectResolved.shapeEntity.shapeId,
        objectResolved.coreShapeKind.baseShapeId,
        name = name,
        diffs = diffsByTrail(shapeTrail)
      ))
    }
  }
  override val oneOfVisitor: OneOfVisitor = new OneOfVisitor {
    override def begin(shapeTrail: ShapeTrail, oneOfShape: ShapeEntity, branches: Seq[ShapeId]): Unit = {

      val nameComponents = branches.map(branch => {
        NameComponent(if (branches.lastOption.contains(branch) && branches.size > 1) "or " else "", "modifier", endText = if (branches.lastOption.contains(branch)) "" else ", ", inner = Some(branch), link = Some(branch))
      })

      pushShape(SpecOneOf(
        oneOfShape.shapeId,
        RenderName(nameComponents),
        branches,
        diffs = diffsByTrail(shapeTrail),
      ))

    }

    override def visit(shapeTrail: ShapeTrail, oneOfShape: ShapeEntity, branchShape: ShapeEntity): Unit = {
    }

    override def end(): Unit = ???
  }
  override val optionalVisitor: GenericWrapperVisitor = new GenericWrapperVisitor {
    override def begin(shapeTrail: ShapeTrail, shape: ShapeEntity, innerShape: Option[ShapeEntity]): Unit = {
      pushShape(
        WrappedType(
          shape.shapeId,
          OptionalKind.baseShapeId,
          RenderName(Seq(NameComponent("", "modifier", " (optional)", innerShape.map(_.shapeId)))),
          innerShape.get.shapeId,
          diffs = diffsByTrail(shapeTrail)
        )
      )
    }
  }
  override val nullableVisitor: GenericWrapperVisitor = new GenericWrapperVisitor {
    override def begin(shapeTrail: ShapeTrail, shape: ShapeEntity, innerShape: Option[ShapeEntity]): Unit = {
      pushShape(
        WrappedType(
          shape.shapeId,
          NullableKind.baseShapeId,
          RenderName(Seq(NameComponent("", "modifier", " (nullable)", innerShape.map(_.shapeId)))),
          innerShape.get.shapeId,
          diffs = diffsByTrail(shapeTrail)
        )
      )
    }
  }
}
