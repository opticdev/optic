package com.useoptic.contexts.rfc

import com.useoptic.contexts.base.BaseCommandContext
import com.useoptic.contexts.requests.Commands.RequestsCommand
import com.useoptic.contexts.requests.Events.RequestsEvent
import com.useoptic.contexts.requests.{RequestsAggregate, RequestsCommandContext}
import com.useoptic.contexts.rfc.Commands.{APISetupCommand, AddContribution, ContributionCommand, RfcCommand, SetAPIName, VersionControlCommand}
import com.useoptic.contexts.rfc.Composition.forwardTo
import com.useoptic.contexts.rfc.Events.{APINamed, ContributionAdded, EventContext, GitStateSet, RfcEvent}
import com.useoptic.contexts.shapes.Commands.ShapesCommand
import com.useoptic.contexts.shapes.Events.ShapesEvent
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesCommandContext, ShapesState}
import com.useoptic.ddd.{Effects, EventSourcedAggregate}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
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

    case _ => noEffect()
  }

  override def applyEvent(event: RfcEvent, state: RfcState): RfcState = {
    event match {
      case shapesEvent: ShapesEvent =>
        state.updateShapes(ShapesAggregate.applyEvent(shapesEvent, state.shapesState))
      case requestsEvent: RequestsEvent =>
        state.updateRequests(RequestsAggregate.applyEvent(requestsEvent, state.requestsState))
      case gitStateSet: GitStateSet => {
        state.updateScm(state.scmState.record(gitStateSet.branchName, gitStateSet.commitId))
      }
      case _ => state
    }
  }

  override def initialState: RfcState = RfcState(RequestsAggregate.initialState, ShapesAggregate.initialState, ScmState.initialState)
}
