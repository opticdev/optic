package com.opticdev.server.http.routes.socket.editors

import akka.actor.{Actor, ActorRef, Status}
import com.opticdev.server.http.routes.socket.{ErrorResponse, Success}
import com.opticdev.server.http.routes.socket.editors.Protocol._

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

    case Context(file, range) => {
      connection ! Success()
    }

    case Search(query) => {
      connection ! Success()
    }

    case event: UpdateOpticEvent => {
      connection ! event
    }

    case UpdateMetaInformation(name, version) => {
      this.name = name
      this.version = version

      connection ! Success()
    }

    case GetMetaInformation() => {
      sender() ! EditorConnection.EditorInformation(name, version)
    }

    case UnknownEvent(raw) => {
      connection ! ErrorResponse("Invalid Request")
    }

  }

}
