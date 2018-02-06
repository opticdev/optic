package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import better.files.File
import play.api.libs.json._
import com.opticdev.server.data.ToJsonImplicits._
import com.opticdev.server.http.routes.socket.editors.Protocol.EditorEvents
package object agents {

  object Protocol {
    //Receives
    sealed trait AgentEvents

    case class Registered(actor: ActorRef) extends AgentEvents
    case class Terminated() extends AgentEvents
    case class UnknownEvent(raw: String) extends AgentEvents

    case class PutUpdate(id: String, newValue: JsObject) extends AgentEvents
    case class AgentSearch(query: String, lastProjectName: Option[String], file: Option[File], range: Option[Range]) extends AgentEvents


    trait UpdateAgentEvent extends OpticEvent

    case class ContextFound(filePath: String, range: Range, results: JsValue, isError: Boolean = false) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("context-found"),
        "filePath" -> JsString(filePath),
        "range" -> range.toJson,
        (if (isError) "errors" else "results") -> results)
      )
    }

    case class SearchResults(query: String, results: JsValue, ignoreQueryUpdate: Boolean = false) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("search-results"),
        "ignoreQueryUpdate" -> JsBoolean(ignoreQueryUpdate),
        "query"-> JsString(query),
        "results"-> results
      ))
    }

  }

}
