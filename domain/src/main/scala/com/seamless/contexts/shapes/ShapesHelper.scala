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

  sealed class CoreShapeKind(val baseShapeId: ShapeId)
  case object ObjectKind extends CoreShapeKind("$object")
  case object ListKind extends CoreShapeKind("$list")
  case object MapKind extends CoreShapeKind("$map")
  case object OneOfKind extends CoreShapeKind("$oneOf")
  case object AnyKind extends CoreShapeKind("$any")
  case object StringKind extends CoreShapeKind("$string")
  case object NumberKind extends CoreShapeKind("$number")
  case object BooleanKind extends CoreShapeKind("$boolean")
  case object IdentifierKind extends CoreShapeKind("$identifier")
  case object ReferenceKind extends CoreShapeKind("$reference")
  case object NullableKind extends CoreShapeKind("$nullable")
  case object OptionalKind extends CoreShapeKind("$optional")

  val allCoreShapes = Set(ObjectKind, ListKind, MapKind, OneOfKind, AnyKind, StringKind, NumberKind, BooleanKind, IdentifierKind, ReferenceKind, NullableKind, OptionalKind)

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

