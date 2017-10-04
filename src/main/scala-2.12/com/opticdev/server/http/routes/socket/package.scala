package com.opticdev.server.http.routes

import akka.actor.ActorRef
import play.api.libs.json.{JsObject, JsString}

package object socket {

  object Protocol {
    //Receives
    sealed trait EditorEvents

    case class Registered(actor: ActorRef) extends EditorEvents

    case class UpdateMetaInformation(editorName: String, version: String) extends EditorEvents

    case class Terminated() extends EditorEvents

    case class Search(input: String) extends EditorEvents

    case class Context(filePath: String, start: Int, end: Int) extends EditorEvents

    case class UnknownEvent(raw: String) extends EditorEvents


    //Emits
    sealed trait OpticEvent {
      def asString: String
    }

    sealed trait UpdateOpticEvent extends OpticEvent

    case class Success() extends OpticEvent {
      def asString = "Success"
    }

    case class RequestMetaInformation() extends {
      def asString = JsObject(Seq("event" -> JsString("requestMeta"))).toString
    }

    case class ErrorResponse(error: String) extends OpticEvent {
      override def asString: String = error
    }

    case class FileUpdate(filePath: String, newContents: String) extends UpdateOpticEvent {
      override def asString: String = JsObject(Seq("event" -> JsString("fileUpdate"))).toString
    }

    case class RangeUpdate(filePath: String, start: Int, end: Int, newContents: String) extends UpdateOpticEvent {
      override def asString: String = JsObject(Seq("event" -> JsString("rangeUpdate"))).toString
    }

  }

  //Internal
  trait InternalEvents
  case class GetMetaInformation() extends InternalEvents

}
