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

  sealed trait CoreShapeKind
  case class ObjectKind() extends CoreShapeKind
  case class ListKind() extends CoreShapeKind
  case class MapKind() extends CoreShapeKind
  case class OneOfKind() extends CoreShapeKind
  case class AnyKind() extends CoreShapeKind
  case class StringKind() extends CoreShapeKind
  case class NumberKind() extends CoreShapeKind
  case class BooleanKind() extends CoreShapeKind


  def toCoreShape(shapeEntity: ShapeEntity): CoreShapeKind = {
    if (shapeEntity.descriptor.baseShapeId == "$object") {
      return ObjectKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$list") {
      return ListKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$map") {
      return MapKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$oneOf") {
      return OneOfKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$reference") {
      // need to resolve the parameter
      return AnyKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$identifier") {
      // need to resolve the parameter
      return AnyKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$string") {
      return StringKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$boolean") {
      return BooleanKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$number") {
      return NumberKind()
    }
    if (shapeEntity.descriptor.baseShapeId == "$any") {
      return AnyKind()
    }
    AnyKind()
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

