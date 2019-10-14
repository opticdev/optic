package com.seamless.contexts.shapes

import com.seamless.contexts.requests.Commands.ShapedRequestParameterShapeDescriptor
import com.seamless.contexts.requests.Events._
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.Events._
import com.seamless.ddd.{AggregateId, EventSourcedRepository, InMemoryEventStore}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Random

@JSExport
@JSExportAll
object ShapesHelper {
  def newShapeId(): String = s"shape_${Random.alphanumeric take 10 mkString}"

  def newShapeParameterId(): String = s"shape-parameter_${Random.alphanumeric take 10 mkString}"

  def newFieldId(): String = s"field_${Random.alphanumeric take 10 mkString}"

  def appendDefaultStringTypeEvents(adder: RequestParameterAdded): Vector[RequestsEvent] = {
    val shapeId = newShapeId()
    Vector(
      adder,
      ShapeAdded(shapeId, "$string", DynamicParameterList(Seq.empty), ""),
      RequestParameterShapeSet(adder.parameterId, ShapedRequestParameterShapeDescriptor(shapeId, isRemoved = false))
    ).asInstanceOf[Vector[RequestsEvent]]
  }

  def appendDefaultStringTypeEvents(adder: PathParameterAdded): Vector[RequestsEvent] = {
    val shapeId = newShapeId()

    Vector(
      adder,
      ShapeAdded(shapeId, "$string", DynamicParameterList(Seq.empty), ""),
      PathParameterShapeSet(adder.pathId, ShapedRequestParameterShapeDescriptor(shapeId, isRemoved = false))
    ).asInstanceOf[Vector[RequestsEvent]]
  }

  sealed class CoreShapeKind(val baseShapeId: ShapeId, val name: String)
  case object ObjectKind extends CoreShapeKind("$object", "Object")
  case object ListKind extends CoreShapeKind("$list", "List")
  case object MapKind extends CoreShapeKind("$map", "Map")
  case object OneOfKind extends CoreShapeKind("$oneOf", "One of")
  case object AnyKind extends CoreShapeKind("$any", "Any")
  case object StringKind extends CoreShapeKind("$string", "String")
  case object NumberKind extends CoreShapeKind("$number", "Number")
  case object BooleanKind extends CoreShapeKind("$boolean", "Boolean")
  case object IdentifierKind extends CoreShapeKind("$identifier", "Identifier")
  case object ReferenceKind extends CoreShapeKind("$reference", "Reference")
  case object NullableKind extends CoreShapeKind("$nullable", "Nullable")
  case object OptionalKind extends CoreShapeKind("$optional", "Optional")
  case object UnknownKind extends CoreShapeKind("$unknown", "Unknown")

  val allCoreShapes = Set(ObjectKind, ListKind, MapKind, OneOfKind, AnyKind, StringKind, NumberKind, BooleanKind, IdentifierKind, ReferenceKind, NullableKind, OptionalKind, UnknownKind)

  def toCoreShape(shapeEntity: ShapeEntity, shapesState: ShapesState): CoreShapeKind = {
    allCoreShapes.find(_.baseShapeId == shapeEntity.descriptor.baseShapeId) match {
      case Some(shape) => shape
      case None => {
        toCoreShape(shapesState.shapes(shapeEntity.descriptor.baseShapeId), shapesState)
      }
    }
  }
}

//STRICTLY FOR TESTING (because everything should go through the root (RfcService))
class ShapesService() {
  private val eventStore = new InMemoryEventStore[ShapesEvent]
  private val repository = new EventSourcedRepository[ShapesState, ShapesEvent](ShapesAggregate, eventStore)

  def handleCommand(id: AggregateId, command: ShapesCommand): Unit = {
    val state = repository.findById(id)
    val effects = ShapesAggregate.handleCommand(state)((ShapesCommandContext(), command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): ShapesState = {
    repository.findById(id)
  }
}

