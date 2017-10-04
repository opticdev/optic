package com.opticdev.server.http.routes.socket

import akka.actor.{Actor, ActorRef, Status}
import com.opticdev.server.http.routes.socket.Protocol._

class EditorConnectionActor(slug: String) extends Actor {

  private var connection : ActorRef = null

  private var name : String = slug
  private var version : String = ""

  override def receive: Receive = {
    case Registered(actorRef) =>
      connection = actorRef

    case Terminated => {
      Status.Success(Unit)
      EditorConnection.killEditor(slug)
    }

    case Context(file, start, end) => {
      connection ! Protocol.Success()
    }

    case Search(query) => {
      connection ! Protocol.Success()
    }

    case event: UpdateOpticEvent => {
      connection ! event
    }

    case UpdateMetaInformation(name, version) => {
      this.name = name
      this.version = version

      connection ! Protocol.Success()
    }

    case GetMetaInformation() => {
      sender() ! EditorConnection.EditorInformation(name, version)
    }

    case UnknownEvent(raw) => {
      connection ! Protocol.ErrorResponse("Invalid Request")
    }

  }

}
