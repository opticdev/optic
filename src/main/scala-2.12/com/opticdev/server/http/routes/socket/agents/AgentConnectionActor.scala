package com.opticdev.server.http.routes.socket.agents

import akka.actor.{Actor, ActorRef, Status}
import com.opticdev.server.http.routes.socket.ErrorResponse
import com.opticdev.server.http.routes.socket.agents.Protocol._

class AgentConnectionActor(slug: String) extends Actor {

  private var connection : ActorRef = null

  private var name : String = slug
  private var version : String = ""

  override def receive: Receive = {
    case Registered(actorRef) =>
      connection = actorRef

    case Terminated => {
      Status.Success(Unit)
      AgentConnection.killAgent(slug)
    }

    case UnknownEvent(raw) => {
      connection ! ErrorResponse("Invalid Request")
    }


    case update: ContextUpdate => connection ! update

  }

}

