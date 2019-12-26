package com.seamless.contexts.rfc.projections
import com.seamless.contexts.requests.Events.RequestAdded
import com.seamless.contexts.rfc.Events.{RfcEvent, SetupStepReached}
import com.seamless.ddd.Projection

case class SetupState(stages: Seq[String])

object SetupStateProjection extends Projection[RfcEvent, SetupState] {
  override def fromEvents(events: Vector[RfcEvent]): SetupState = {
    withInitialState(SetupState(Seq.empty), events)
  }

  //some come from Events, others from internal state
  override def withInitialState(initialState: SetupState, events: Vector[RfcEvent]): SetupState = {
    val seq = events.collect{
      case SetupStepReached(stage, _) => stage
      case RequestAdded(_, _, _, _) => "documented-api-endpoint"
    }.distinct.toSeq
    SetupState(initialState.stages ++ seq)
  }

}
