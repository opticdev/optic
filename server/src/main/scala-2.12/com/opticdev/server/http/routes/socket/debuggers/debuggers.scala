package com.opticdev.server.http.routes.socket.debuggers

import akka.actor.ActorRef
import better.files.File
import com.opticdev.core.debug.DebugInfo
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import com.opticdev.server.http.routes.socket.OpticEvent
import com.opticdev.server.http.routes.socket.editors.Protocol.EditorEvents
import play.api.libs.json.{JsObject, JsString, JsValue}
import com.opticdev.server.data.ToJsonImplicits._

package object debuggers {

  object Protocol {
    //Receives
    sealed trait DebuggerEvents

    case class Registered(actor: ActorRef) extends DebuggerEvents

    case class Terminated() extends DebuggerEvents

    case class UnknownEvent(raw: String) extends DebuggerEvents

    //Emits
    sealed trait UpdateDebuggerEvent extends OpticEvent

    case object DebugLoading extends UpdateDebuggerEvent {
      override def asJson: JsValue = JsObject(
          Seq("event"-> JsString("debug-information")
        ))
    }

    case class DebugInformation(filePath: String, range: Range, debugInfo: DebugInfo) extends UpdateDebuggerEvent {
      override def asJson: JsObject = JsObject(Seq(
        "event"-> JsString("debug-information"),
        "payload" -> debugInfo.toJson,
        "filePath" -> JsString(filePath),
        "range" -> range.toJson,
      ))
    }

  }

}
