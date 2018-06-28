package com.opticdev.server.http.routes.socket.editors

import akka.actor.{Actor, ActorRef, Status}
import better.files.File
import com.opticdev.server.http.controllers.{ArrowQuery, ContextQuery}
import com.opticdev.server.http.helpers.IsMarkdown
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.agents.Protocol.{ContextFound, NoContextFound, SearchResults}
import com.opticdev.server.http.routes.socket.{ErrorResponse, Success}
import com.opticdev.server.http.routes.socket.editors.Protocol._
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsObject, JsString}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

class EditorConnectionActor(slug: String, autorefreshes: Boolean, projectsManager: ProjectsManager) extends Actor {

  private var connection : ActorRef = null

  override def receive: Receive = {
    case Registered(actorRef) =>
      connection = actorRef

    case Terminated => {
      Status.Success(Unit)
      EditorConnection.killEditor(slug)
    }

    case Context(file, range, contentsOption) => {
      val asFile = File(file)

      new ContextQuery(asFile, range, contentsOption, slug)(projectsManager).execute
        .map(i => {
          import com.opticdev.server.data.ModelNodeJsonImplicits._
          val contextFound = Try(ContextFound(file, range, i.projectName, i.editorSlug, JsObject(Seq(
            "models" -> JsArray(i.modelNodes.map(_.asJson()(projectsManager))),
            "transformations" -> JsArray(i.availableTransformations.map(_.asJson))
          ))))
          AgentConnection.broadcastUpdate(contextFound.get)
        })
    }

    case search: EditorSearch => {
      ArrowQuery(search, search.editorSlug)(projectsManager).executeToApiResponse.map(i=> {
        println("SEARCH RESULTS "+ i.data)
        AgentConnection.broadcastUpdate( SearchResults(search.query, i.data) )
      }).recover {
        case a: Throwable => {
          a.printStackTrace()
          AgentConnection.broadcastUpdate( SearchResults(search.query) )
        }
      }
    }

    case event: UpdateEditorEvent => {
      connection ! event
    }

    case UnknownEvent(raw) => {
      connection ! ErrorResponse("Invalid Request")
    }

    case filesUpdates: FilesUpdated => {
      connection ! filesUpdates
    }

  }

}
