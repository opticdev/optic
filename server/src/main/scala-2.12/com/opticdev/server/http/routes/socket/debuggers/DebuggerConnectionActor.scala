package com.opticdev.server.http.routes.socket.debuggers

import akka.actor.{Actor, ActorRef, Status}
import better.files.File
import com.opticdev.server.http.routes.socket.debuggers.debuggers.Protocol._
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.ExecutionContext.Implicits.global

class DebuggerConnectionActor(slug: String, projectsManager: ProjectsManager) extends Actor {

  private var connection : ActorRef = null

  private var name : String = slug
  private var version : String = ""

  override def receive: Receive = {
    case Registered(actorRef) =>
      connection = actorRef

    case Terminated => {
      Status.Success(Unit)
      DebuggerConnection.killDebugger(slug)
    }

    case event: UpdateDebuggerEvent => {
      connection ! event
    }

  }

}
