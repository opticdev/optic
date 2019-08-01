package com.seamless.contexts.rfc

import com.seamless.contexts.rfc.Commands.{AddContribution, ContributionCommand, RfcCommand, SetAPIName}
import com.seamless.contexts.rfc.Events.{APINamed, ContributionAdded, RfcEvent}
import com.seamless.ddd.{Effects, EventSourcedAggregate}
import Composition.forwardTo
import com.seamless.contexts.base.BaseCommandContext
import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.requests.{RequestsAggregate, RequestsCommandContext}
import com.seamless.contexts.shapes.Commands.ShapesCommand
import com.seamless.contexts.shapes.Events.ShapesEvent
import com.seamless.contexts.shapes.{ShapesAggregate, ShapesCommandContext}

case class RfcCommandContext() extends BaseCommandContext

object RfcAggregate extends EventSourcedAggregate[RfcState, RfcCommand, RfcCommandContext, RfcEvent] {

  override def handleCommand(state: RfcState): PartialFunction[(RfcCommandContext, RfcCommand), Effects[RfcEvent]] = {
    case (_: RfcCommandContext, command: ShapesCommand) =>
      forwardTo(ShapesAggregate)((ShapesCommandContext(), command), state.shapesState).asInstanceOf[Effects[RfcEvent]]
    case (_: RfcCommandContext, command: RequestsCommand) =>
      forwardTo(RequestsAggregate)((RequestsCommandContext(state.shapesState), command), state.requestsState).asInstanceOf[Effects[RfcEvent]]

    case (_: RfcCommandContext, contributionCommand: ContributionCommand) => contributionCommand match {
      case AddContribution(id, key, value) => persist(ContributionAdded(id, key, value))
      case SetAPIName(name) => persist(APINamed(name))
      case _ => noEffect()
    }
    case _ => noEffect()
  }

  override def applyEvent(event: RfcEvent, state: RfcState): RfcState = {
    event match {
      case shapesEvent: ShapesEvent =>
        state.updateShapes(ShapesAggregate.applyEvent(shapesEvent, state.shapesState))
      case requestsEvent: RequestsEvent =>
        state.updateRequests(RequestsAggregate.applyEvent(requestsEvent, state.requestsState))
      case _ => state
    }
  }

  override def initialState: RfcState = RfcState(RequestsAggregate.initialState, ShapesAggregate.initialState)
}
