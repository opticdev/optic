package com.opticdev.server.http.routes.socket.editors

import akka.actor.{Actor, ActorRef, Status}
import better.files.File
import com.opticdev.server.http.controllers.{ArrowQuery, ContextQuery}
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.agents.Protocol.{ContextFound, SearchResults}
import com.opticdev.server.http.routes.socket.{ErrorResponse, Success}
import com.opticdev.server.http.routes.socket.editors.Protocol._
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.JsArray

import scala.concurrent.ExecutionContext.Implicits.global

class EditorConnectionActor(slug: String, projectsManager: ProjectsManager) extends Actor {

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

    case Context(file, range, contentsOption) => {
      new ContextQuery(File(file), range, contentsOption)(projectsManager).executeToApiResponse
        .map(i=> {
          println(i)
          AgentConnection.broadcastUpdate( ContextFound(file, range, i.data) )
        })
    }

    case search: EditorSearch => {
      ArrowQuery(search)(projectsManager).executeToApiResponse.map(i=> {
        AgentConnection.broadcastUpdate( SearchResults(search.query, i.data) )
      })
    }

    case event: UpdateEditorEvent => {
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

    case filesUpdates: FilesUpdated => {
      connection ! filesUpdates
    }

  }

}
