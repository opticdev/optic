package com.opticdev.server.http.routes.socket.agents

import akka.actor.{Actor, ActorRef, Status}
import com.opticdev.arrow.changes.evaluation.BatchedChanges
import com.opticdev.core.sourcegear.sync.SyncPatch
import com.opticdev.server.http.controllers.{ArrowPostChanges, ArrowQuery, PutUpdateRequest}
import com.opticdev.server.http.routes.socket.ErrorResponse
import com.opticdev.server.http.routes.socket.agents.Protocol._
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.http.routes.socket.editors.Protocol.FilesUpdated
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

class AgentConnectionActor(slug: String, projectsManager: ProjectsManager) extends Actor {

  private var connection : ActorRef = null

  private var name : String = slug
  private var version : String = ""

  override def receive: Receive = {
    case Registered(actorRef) => {
//      println("worked correctly")
      connection = actorRef
      //trigger a status update to send to Agent
      projectsManager.sendMostRecentUpdate
    }
    case Terminated => {
      Status.Success(Unit)
      AgentConnection.killAgent(slug)
    }

    //message to client routing
    case UnknownEvent(raw) => {
      connection ! ErrorResponse("Invalid Request")
    }

    case search: AgentSearch => {
      ArrowQuery(search, projectsManager.lastProjectName, search.editorSlug)(projectsManager).executeToApiResponse.foreach(i=> {
        AgentConnection.broadcastUpdate( SearchResults(search.query, i.data, ignoreQueryUpdate = true) )
      })
    }

    case postChanges: PostChanges => {
      implicit val autorefreshes = EditorConnection.listConnections.get(postChanges.editorSlug).map(_.autorefreshes).getOrElse(false)
      val future = new ArrowPostChanges(postChanges.projectName, postChanges.changes)(projectsManager).execute

      future.foreach(i=> {
        AgentConnection.broadcastUpdate( PostChangesResults(true, i.stagedFiles.keys.toSet) )
        EditorConnection.broadcastUpdateTo(postChanges.editorSlug, FilesUpdated(i.stagedFiles) )
      })

      future.onComplete(i=> {
        if (i.isFailure) {
          i.failed.foreach(_.printStackTrace())
          AgentConnection.broadcastUpdate( PostChangesResults(success = false, Set(), Some(i.failed.get.getMessage)) )
        }
      })

    }

    case update : PutUpdate => {
      //@todo handle error states
      implicit val autorefreshes = EditorConnection.listConnections.get(update.editorSlug).map(_.autorefreshes).getOrElse(false)
      new PutUpdateRequest(update.id, update.newValue, update.editorSlug, update.projectName)(projectsManager)
        .execute.foreach {
        case bc:BatchedChanges => {
          AgentConnection.broadcastUpdate( PostChangesResults(bc.isSuccess, bc.stagedFiles.keys.toSet) )
          EditorConnection.broadcastUpdateTo( update.editorSlug, FilesUpdated(bc.stagedFiles) )
        }
      }

    }

    case StageSync(projectName, editorSlug) => {

      val projectLookup = projectsManager.lookupProject(projectName)

      if (projectLookup.isSuccess) {
        val future = projectLookup.get.syncPatch
        future.foreach {
          case patch: SyncPatch => AgentConnection.broadcastUpdate(StagedSyncResults(patch, editorSlug))
        }
      } else {
        AgentConnection.broadcastUpdate(StagedSyncResults(SyncPatch.empty, editorSlug))
      }

    }

    case updateAgentEvent: UpdateAgentEvent => {
      connection ! updateAgentEvent
    }

  }

}

