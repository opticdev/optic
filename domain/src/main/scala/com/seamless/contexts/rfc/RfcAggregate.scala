package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}
import com.seamless.contexts.rfc.Commands.{RfcCommand, StartRfc}
import com.seamless.contexts.rfc.Events.{RfcEvent, RfcStarted}
import com.seamless.ddd.{AggregateId, Effects, EventSourcedAggregate}
import Composition.forwardTo
import com.seamless.contexts.data_types.Commands.DataTypesCommand
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.rest.RestAggregate

object RfcAggregate extends EventSourcedAggregate[RfcState, RfcCommand, RfcEvent] {

  override def handleCommand(state: RfcState): PartialFunction[RfcCommand, Effects[RfcEvent]] = {
    case command: DataTypesCommand =>
      forwardTo(DataTypesAggregate)(command, state.restState.dataTypesState).asInstanceOf[Effects[RfcEvent]]
    case _ => noEffect()
  }

  override def applyEvent(event: RfcEvent, state: RfcState): RfcState = {
    event match {
      case dataTypesEvent: DataTypesEvent =>
        state.updateDataTypes(DataTypesAggregate.applyEvent(dataTypesEvent, state.restState.dataTypesState))
      case _ => state
    }
  }

  override def initialState: RfcState = RfcState(RestAggregate.initialState)
}
