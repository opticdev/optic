package com.opticdev.server.http.routes.socket

import akka.actor.ActorRef
import better.files.{File, Files}
import com.opticdev.arrow.changes.{ChangeGroup, JsonImplicits}
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.graph.{NamedFile, NamedModel}
import com.opticdev.core.sourcegear.project.status.ImmutableProjectStatus
import com.opticdev.core.sourcegear.sync.SyncPatch
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import play.api.libs.json._
import com.opticdev.server.data.ToJsonImplicits._
import com.opticdev.server.http.controllers.ArrowTransformationOptions
import com.opticdev.server.http.routes.socket.agents.Protocol.UpdateAgentEvent
import com.opticdev.server.http.routes.socket.editors.Protocol.EditorEvents
package object agents {

  object Protocol {
    //Receives
    sealed trait AgentEvents

    case class Registered(actor: ActorRef) extends AgentEvents
    case object Terminated extends AgentEvents
    case class UnknownEvent(raw: String) extends AgentEvents
    case class Pong() extends AgentEvents

    case class PutUpdate(id: String, newValue: JsObject, editorSlug: Option[String]) extends AgentEvents
    case class PostChanges(changes: ChangeGroup, editorSlug: Option[String]) extends AgentEvents
    case class TransformationOptions(transformation: TransformationRef) extends AgentEvents
    case class AgentSearch(query: String, lastProjectName: Option[String], file: Option[File], range: Option[Range], contents: Option[String], editorSlug: String) extends AgentEvents

    case class StageSync(editorSlug: String) extends AgentEvents


    //Sends
    trait UpdateAgentEvent extends OpticEvent {
      val projectDirectory: String
    }

    case class ContextFound(filePath: String, relativeFilePath: String, range: Range, projectName: String, editorSlug: String, results: JsValue, isError: Boolean = false)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("context-found"),
        "projectName"-> JsString(projectName),
        "editorSlug"-> JsString(editorSlug),
        "filePath" -> JsString(filePath),
        "relativeFilePath" -> JsString(relativeFilePath),
        "range" -> range.toJson,
        (if (isError) "errors" else "results") -> results)
      )
    }

    case class TransformationOptionsFound(transformationOptions: ArrowTransformationOptions)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      import JsonImplicits.modelOptionsFormat
      def asJson = JsObject(Seq(
        "event"-> JsString("transformation-options-found"),
        "options" -> JsArray(transformationOptions.modelOptions.map((i) => Json.toJson(i))),
        "transformationRef" -> JsString(transformationOptions.transformationRef.full),
        "error" -> JsBoolean(false),
      ))
    }

    case class TransformationOptionsError()(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("transformation-options-found"),
        "error" -> JsBoolean(true)
      ))
    }


    case class NoContextFound(filePath: String, range: Range, isError: Boolean = false)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("context-found"),
        "filePath" -> JsString(filePath),
        "range" -> range.toJson,
        (if (isError) "errors" else "results") -> JsObject(Seq("models" -> JsArray.empty, "transformations" -> JsArray.empty)))
      )
    }

    case class SearchResults(query: String, results: JsValue = JsObject(Seq("models" -> JsArray.empty, "transformations" -> JsArray.empty)), ignoreQueryUpdate: Boolean = false)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("search-results"),
        "ignoreQueryUpdate" -> JsBoolean(ignoreQueryUpdate),
        "query"-> JsString(query),
        "results"-> results
      ))
    }

    case class PostChangesResults(success: Boolean, filesUpdated: Set[File], error: Option[String] = None)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("post-changes-results"),
        "success"-> JsBoolean(success),
        "filesChanges" -> JsArray(filesUpdated.map(i=> JsString(i.pathAsString)).toSeq),
        "error" -> error.map(JsString).getOrElse(JsNull)
      ))
    }

    case class CopyToClipboard(text: String)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
      def asJson = JsObject(Seq(
        "event"-> JsString("copy-to-clipboard"),
        "text"-> JsString(text)
      ))
    }

  }

  case class StatusUpdate(projectName: String, immutableProjectStatus: ImmutableProjectStatus)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
    def asJson = JsObject(Seq(
      "event"-> JsString("status-update"),
      "projectName"-> JsString(projectName),
      "status"-> immutableProjectStatus.asJson
    ))
  }

  case class KnowledgeGraphUpdate(projectName: String, knowledgeGraph: JsObject)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
    def asJson = JsObject(Seq(
      "event"-> JsString("knowledge-graph-update"),
      "projectName"-> JsString(projectName),
      "knowledgeGraph"-> knowledgeGraph
    ))
  }

  case class ModelNodeOptionsUpdate(projectName: String, modelNodeOptions: Set[NamedModel], fileNodeOptions: Set[NamedFile])(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
    def asJson = JsObject(Seq(
      "event"-> JsString("model-node-options-update"),
      "projectName"-> JsString(projectName),
      "modelOptions"-> JsArray(modelNodeOptions.map(_.toJson).toSeq),
      "fileOptions"-> JsArray(fileNodeOptions.map(_.toJson).toSeq)
    ))
  }

  case class StagedSyncResults(syncPatch: SyncPatch, editorSlug: String)(implicit val projectDirectory: String) extends OpticEvent with UpdateAgentEvent {
    override def asJson: JsValue = JsObject(Seq(
      "event"-> JsString("sync-staged"),
      "patch" -> syncPatch.asJson(editorSlug)
    ))
  }

}
