package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.Commands.{ConceptId, DataTypesCommand}
import com.seamless.contexts.data_types.DataTypesState
import com.seamless.contexts.data_types.projections.ShapeProjection
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.{AggregateId, EventSourcedRepository, EventSourcedService, InMemoryEventStore}
import com.seamless.serialization.CommandSerialization

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Try

class RfcService extends EventSourcedService[RfcCommand, RfcState] {
  private val eventStore = new InMemoryEventStore[RfcEvent]
  private val repository = new EventSourcedRepository[RfcState, RfcEvent](RfcAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RfcCommand): Unit = {
    val state = repository.findById(id)
    val context = RfcCommandContext()
    val effects = RfcAggregate.handleCommand(state)((context, command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RfcState = {
    repository.findById(id)
  }

  @JSExport
  def commandHandlerForAggregate(id: AggregateId): js.Function1[RfcCommand, Unit] = (command: RfcCommand) => {
    handleCommand(id, command)
  }

  //Queries
  @JSExport
  def currentShapeProjection(id: AggregateId, conceptId: ConceptId): ShapeProjection = {
    ShapeProjection.fromState(currentState(id).dataTypesState, conceptId)
  }

}

@JSExport
@JSExportAll
object RfcServiceJSFacade {

  def fromCommands(commands: Vector[RfcCommand], id: AggregateId): RfcService = {
    val service = new RfcService
    commands.foreach(service.handleCommand(id, _))
    service
  }


  def fromCommands(jsonString: String, id: AggregateId): RfcService = {
    import io.circe._, io.circe.parser._

    val commandsVector =
    for {
      json <- Try(parse(jsonString).right.get)
      commandsVector <- CommandSerialization.fromJson(json)
    } yield commandsVector

    require(commandsVector.isSuccess, "failed to parse commands")

    fromCommands(commandsVector.get, id)
  }
}

