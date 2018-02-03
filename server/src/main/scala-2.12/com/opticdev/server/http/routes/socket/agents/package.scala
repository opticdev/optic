package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}
import com.opticdev.server.data.ToJsonImplicits._
package object agents {

  object Protocol {
    //Receives
    sealed trait AgentEvents

    case class Registered(actor: ActorRef) extends AgentEvents
    case class Terminated() extends AgentEvents
    case class PutUpdate(id: String, newValue: JsObject) extends AgentEvents
    case class UnknownEvent(raw: String) extends AgentEvents


    trait UpdateAgentEvent extends OpticEvent

    case class ContextFound(filePath: String, range: Range, results: JsValue, isError: Boolean = false) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("context-found"),
        "filePath" -> JsString(filePath),
        "range" -> range.toJson,
        (if (isError) "errors" else "results") -> results)
      )
    }

    case class SearchResults(query: String, results: JsValue) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("search-results"),
        "query"-> JsString(query),
        "results"-> results
      ))
    }

  }

}
