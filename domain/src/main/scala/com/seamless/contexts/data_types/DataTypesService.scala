package com.seamless.contexts.data_types

import Events.DataTypesEvent
import com.seamless.contexts.data_types.Commands.{ConceptId, DataTypesCommand}
import com.seamless.contexts.data_types.Primitives.{PrimitiveType, RefT}
import com.seamless.ddd.{AggregateId, EventSourcedRepository, InMemoryEventStore}

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportNamed}
import scala.util.Random

//STRICTLY FOR TESTING (because everything should go through the root (RfcService))
class DataTypesService {
  private val eventStore = new InMemoryEventStore[DataTypesEvent]
  private val repository = new EventSourcedRepository[DataTypesState, DataTypesEvent](DataTypesAggregate, eventStore)

  def handleCommand(id: AggregateId, command: DataTypesCommand): Unit = {
    val state = repository.findById(id)
    val context = DataTypesCommandContext()
    val effects = DataTypesAggregate.handleCommand(state)((context, command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): DataTypesState = {
    repository.findById(id)
  }
}

@JSExport
@JSExportAll
object DataTypesServiceHelper {
  def newId(): String = s"shape_${Random.alphanumeric take 10 mkString}"
  def newConceptId(): String = s"concept_${Random.alphanumeric take 10 mkString}"

  def primitivesMap: js.Dictionary[PrimitiveType] = {
    import js.JSConverters._
    Primitives.all.map(i => i.id -> i).toMap.toJSDictionary
  }

  def primitiveArray: js.Array[PrimitiveType] = {
    import js.JSConverters._
    Primitives.all.toJSArray
  }

  def refTo(string: ConceptId): RefT = RefT(string)
}