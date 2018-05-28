package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import play.api.libs.json.{JsObject, JsString}

package object editors {

  object Protocol {
    //Receives
    sealed trait EditorEvents

    case class Registered(actor: ActorRef) extends EditorEvents

    case class UpdateMetaInformation(editorName: String, version: String) extends EditorEvents

    case class Terminated() extends EditorEvents

    case class EditorSearch(query: String, file: File, range: Range, contentsOption: Option[String], editorSlug: String) extends EditorEvents

    case class Context(filePath: String, range: Range, contentsOption: Option[String]) extends EditorEvents

    case class UnknownEvent(raw: String) extends EditorEvents


    //Emits

    sealed trait UpdateEditorEvent extends OpticEvent

    case class FilesUpdated(fileUpdates: Map[File, StagedContent]) extends UpdateEditorEvent {
      override def asJson = {

        val updates = JsObject(fileUpdates.map(i=> (i._1.pathAsString, JsString(i._2.text)) ))

        JsObject(Seq("event" -> JsString("files-updated"), "updates" -> updates))
      }
    }

  }

  //Internal
  trait InternalEvents
  case class GetMetaInformation() extends InternalEvents

}
