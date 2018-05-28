package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import better.files.{File, Files}
import com.opticdev.arrow.changes.ChangeGroup
import com.opticdev.core.sourcegear.project.status.ImmutableProjectStatus
import com.opticdev.core.sourcegear.sync.SyncPatch
import play.api.libs.json._
import com.opticdev.server.data.ToJsonImplicits._
import com.opticdev.server.http.routes.socket.agents.Protocol.UpdateAgentEvent
import com.opticdev.server.http.routes.socket.editors.Protocol.EditorEvents
package object agents {

  object Protocol {
    //Receives
    sealed trait AgentEvents

    case class Registered(actor: ActorRef) extends AgentEvents
    case object Terminated extends AgentEvents
    case class UnknownEvent(raw: String) extends AgentEvents

    case class PutUpdate(id: String, newValue: JsObject, editorSlug: String) extends AgentEvents
    case class PostChanges(projectName: String, changes: ChangeGroup, editorSlug: String) extends AgentEvents
    case class AgentSearch(query: String, lastProjectName: Option[String], file: Option[File], range: Option[Range], contents: Option[String], editorSlug: String) extends AgentEvents

    case class StageSync(projectName: String) extends AgentEvents


    //Sends
    trait UpdateAgentEvent extends OpticEvent

    case class ContextFound(filePath: String, range: Range, projectName: String, editorSlug: String, results: JsValue, isError: Boolean = false) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("context-found"),
        "projectName"-> JsString(projectName),
        "editorSlug"-> JsString(editorSlug),
        "filePath" -> JsString(filePath),
        "range" -> range.toJson,
        (if (isError) "errors" else "results") -> results)
      )
    }

    case class NoContextFound(filePath: String, range: Range, isError: Boolean = false) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("context-found"),
        "filePath" -> JsString(filePath),
        "range" -> range.toJson,
        (if (isError) "errors" else "results") -> JsObject(Seq("models" -> JsArray.empty, "transformations" -> JsArray.empty)))
      )
    }

    case class SearchResults(query: String, results: JsValue = JsObject(Seq("models" -> JsArray.empty, "transformations" -> JsArray.empty)), ignoreQueryUpdate: Boolean = false) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("search-results"),
        "ignoreQueryUpdate" -> JsBoolean(ignoreQueryUpdate),
        "query"-> JsString(query),
        "results"-> results
      ))
    }

    case class PostChangesResults(success: Boolean, filesUpdated: Set[File]) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("post-changes-results"),
        "success"-> JsBoolean(success),
        "filesChanges" -> JsArray(filesUpdated.map(i=> JsString(i.pathAsString)).toSeq)
      ))
    }

  }

  case class StatusUpdate(projectName: String, immutableProjectStatus: ImmutableProjectStatus) extends OpticEvent with UpdateAgentEvent {
    def asJson = JsObject(Seq(
      "event"-> JsString("status-update"),
      "projectName"-> JsString(projectName),
      "status"-> immutableProjectStatus.asJson
    ))
  }

  case class KnowledgeGraphUpdate(projectName: String, knowledgeGraph: JsObject) extends OpticEvent with UpdateAgentEvent {
    def asJson = JsObject(Seq(
      "event"-> JsString("knowledge-graph-update"),
      "projectName"-> JsString(projectName),
      "knowledgeGraph"-> knowledgeGraph
    ))
  }

  case class StagedSyncResults(syncPatch: SyncPatch) extends OpticEvent with UpdateAgentEvent {
    override def asJson: JsValue = JsObject(Seq(
      "event"-> JsString("sync-staged"),
      "patch" -> syncPatch.asJson
    ))
  }

}
