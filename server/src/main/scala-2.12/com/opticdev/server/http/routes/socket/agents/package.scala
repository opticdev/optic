package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import play.api.libs.json.{JsObject, JsString, JsValue}

package object agents {

  object Protocol {
    //Receives
    sealed trait AgentEvents

    case class Registered(actor: ActorRef) extends AgentEvents
    case class Terminated() extends AgentEvents
    case class PutUpdate(id: String, newValue: JsObject) extends AgentEvents
    case class UnknownEvent(raw: String) extends AgentEvents


    trait UpdateAgentEvent extends OpticEvent

  }

}
