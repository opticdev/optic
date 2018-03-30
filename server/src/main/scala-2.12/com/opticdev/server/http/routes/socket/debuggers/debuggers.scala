package com.opticdev.server.http.routes.socket.debuggers

import akka.actor.ActorRef
import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import com.opticdev.server.http.routes.socket.OpticEvent
import com.opticdev.server.http.routes.socket.editors.Protocol.EditorEvents
import play.api.libs.json.{JsObject, JsString}

package object debuggers {

  object Protocol {
    //Receives
    sealed trait DebuggerEvents

    case class Registered(actor: ActorRef) extends DebuggerEvents

    case class Terminated() extends DebuggerEvents


    //Emits
    sealed trait UpdateDebuggerEvent extends OpticEvent
  }

}
