package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import play.api.libs.json.{JsObject, JsString}

package object editors {

  object Protocol {
    //Receives
    sealed trait EditorEvents

    case class Registered(actor: ActorRef) extends EditorEvents

    case class UpdateMetaInformation(editorName: String, version: String) extends EditorEvents

    case class Terminated() extends EditorEvents

    case class Search(input: String) extends EditorEvents

    case class Context(filePath: String, range: Range) extends EditorEvents

    case class UnknownEvent(raw: String) extends EditorEvents


    //Emits

    sealed trait UpdateOpticEvent extends OpticEvent

    case class RequestMetaInformation() extends {
      def asJson = JsObject(Seq("event" -> JsString("requestMeta")))
    }

    case class FileUpdate(filePath: String, newContents: String) extends UpdateOpticEvent {
      override def asJson = JsObject(Seq("event" -> JsString("fileUpdate")))
    }

    case class RangeUpdate(filePath: String, start: Int, end: Int, newContents: String) extends UpdateOpticEvent {
      override def asJson = JsObject(Seq("event" -> JsString("rangeUpdate")))
    }

  }

  //Internal
  trait InternalEvents
  case class GetMetaInformation() extends InternalEvents

}
