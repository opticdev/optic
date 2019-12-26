package com.seamless.contexts.rfc

import com.seamless.contexts.base.BaseCommandContext
import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.requests.{RequestsAggregate, RequestsCommandContext}
import com.seamless.contexts.rfc.Commands.{APISetupCommand, AddContribution, ContributionCommand, RfcCommand, SetAPIName, VersionControlCommand}
import com.seamless.contexts.rfc.Composition.forwardTo
import com.seamless.contexts.rfc.Events.{APINamed, ContributionAdded, EventContext, RfcEvent, SetupStepReached}
import com.seamless.contexts.shapes.Commands.ShapesCommand
import com.seamless.contexts.shapes.Events.ShapesEvent
import com.seamless.contexts.shapes.{ShapesAggregate, ShapesCommandContext, ShapesState}
import com.seamless.ddd.{Effects, EventSourcedAggregate}

case class RfcCommandContext(
                              override val clientId: String,
                              override val clientSessionId: String,
                              override val clientCommandBatchId: String
                            ) extends BaseCommandContext {
  def toShapesCommandContext() = {
    ShapesCommandContext(
      clientId = this.clientId,
      clientSessionId = this.clientSessionId,
      clientCommandBatchId = this.clientCommandBatchId
    )
  }

  def toRequestsCommandContext(shapesState: ShapesState) = {
    RequestsCommandContext(
      clientId = this.clientId,
      clientSessionId = this.clientSessionId,
      clientCommandBatchId = this.clientCommandBatchId,
      shapesState = shapesState
    )
  }
}

object RfcAggregate extends EventSourcedAggregate[RfcState, RfcCommand, RfcCommandContext, RfcEvent] {

  override def handleCommand(state: RfcState): PartialFunction[(RfcCommandContext, RfcCommand), Effects[RfcEvent]] = {

    case (cc: RfcCommandContext, command: ShapesCommand) =>
      forwardTo(ShapesAggregate)((cc.toShapesCommandContext(), command), state.shapesState).asInstanceOf[Effects[RfcEvent]]
    case (cc: RfcCommandContext, command: RequestsCommand) =>
      forwardTo(RequestsAggregate)((cc.toRequestsCommandContext(state.shapesState), command), state.requestsState).asInstanceOf[Effects[RfcEvent]]

    case (cc: RfcCommandContext, contributionCommand: ContributionCommand) => {
      val eventContext: Option[EventContext] = Some(Events.fromCommandContext(cc))
      contributionCommand match {
        case AddContribution(id, key, value) => persist(ContributionAdded(id, key, value, eventContext))
        case SetAPIName(name) => persist(APINamed(name, eventContext))
        case _ => noEffect()
      }
    }

    case (cc: RfcCommandContext, versionControlCommand: VersionControlCommand) => {
      val eventContext: Option[EventContext] = Some(Events.fromCommandContext(cc))
      versionControlCommand match {
        case c: Commands.SetGitState => {
          persist(Events.GitStateSet(c.branchName, c.commitId, eventContext))
        }
        case _ => noEffect()
      }
    }

    case (cc: RfcCommandContext, apiSetupCommand: APISetupCommand) => {
      val eventContext: Option[EventContext] = Some(Events.fromCommandContext(cc))
      apiSetupCommand match {
        case c: Commands.MarkSetupStageComplete => {
          persist(Events.SetupStepReached(c.step))
        }
        case _ => noEffect()
      }
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
