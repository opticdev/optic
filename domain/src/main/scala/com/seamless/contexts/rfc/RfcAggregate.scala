package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}
import com.seamless.contexts.rfc.Commands.{RfcCommand, StartRfc}
import com.seamless.contexts.rfc.Events.{RfcEvent, RfcStarted}
import com.seamless.ddd.{AggregateId, Effects, EventSourcedAggregate}
import Composition.forwardTo
import com.seamless.contexts.data_types.Commands.DataTypesCommand
import com.seamless.contexts.data_types.Events.DataTypesEvent

object RfcAggregate extends EventSourcedAggregate[RfcState, RfcCommand, RfcEvent] {
  override def handleCommand(state: RfcState): PartialFunction[RfcCommand, Effects[RfcEvent]] = {
    case command: DataTypesCommand =>
      forwardTo(DataTypesAggregate)(command, state.dataTypes).asInstanceOf[Effects[RfcEvent]]
    case _ => noEffect()
  }

  override def applyEvent(event: RfcEvent, state: RfcState): RfcState = {
    event match {
      case dataTypesEvent: DataTypesEvent =>
        state.copy(dataTypes = DataTypesAggregate.applyEvent(dataTypesEvent, state.dataTypes))
      case _ => state
    }
  }

  override def initialState: RfcState = RfcState(DataTypesAggregate.initialState)
}
