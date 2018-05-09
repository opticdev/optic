package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import play.api.libs.json._
import scalax.collection.edge.LkDiEdge
import com.opticdev.common.fileFormat
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.objects.annotations.TagAnnotation
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.sdk.descriptions.SchemaRef

package object sync {

  case class SyncSubGraph(sources: Int, targets: Int, warnings: Vector[SyncWarning], syncGraph: ProjectGraph) {
    def noWarnings : Boolean = warnings.isEmpty
  }

  sealed trait SyncWarning { def asJson: JsValue }
  case class DuplicateSourceName(name: String, locations: Vector[AstDebugLocation]) extends SyncWarning {
    override def asJson: JsValue = JsObject(Seq(
      "message" -> JsString(s"Source name '$name' is defined in multiple locations. All instances will be ignored"),
      "locations" -> JsArray(locations.map(i=> JsString(i.toString))
    )))
  }

  case class SourceDoesNotExist(missingSource: String, location: AstDebugLocation) extends SyncWarning {
    override def asJson: JsValue = JsObject(Seq(
      "message" -> JsString(s"Source '${missingSource}' was not found."),
      "locations" -> JsArray(Seq(JsString(location.toString)))
    ))
  }

  case class CircularDependency(targeting: String, location: AstDebugLocation) extends SyncWarning {
    override def asJson: JsValue = JsObject(Seq(
      "message" -> JsString(s"Using '${targeting}' as a source would lead to a circular dependency. This instance will be ignored."),
      "locations" -> JsArray(Seq(JsString(location.toString)))
    ))
  }

  implicit val triggerFormat = Json.format[Trigger]
  case class Trigger(name: String, schemaRef: SchemaRef, newValue: JsObject)

  case class RangePatch(range: Range, newRaw: String, file: File, fileContents: String)
  trait FilePatchTrait {
    def file: File
    def originalFileContents: String
    def newFileContents: String
  }

  implicit val filePatchFormat = Json.format[FilePatch]
  case class FilePatch(file: File, originalFileContents: String, newFileContents: String) extends FilePatchTrait {
    def asJson(relativePath: String) = Json.toJson[FilePatch](this).as[JsObject] + ("relativePath" -> JsString(relativePath))
  }

  sealed trait SyncDiff {
    val edge: DerivedFrom
    def newValue : Option[JsObject] = None
    def isError : Boolean = false
  }

  case class NoChange(edge: DerivedFrom, tagOption: Option[TagAnnotation] = None) extends SyncDiff
  case class Replace(edge: DerivedFrom, schemaRef: SchemaRef, before: JsObject, after: JsObject, rangePatch: RangePatch, trigger: Option[Trigger] = None) extends SyncDiff { override def newValue = Some(after) }
  case class UpdatedTag(tag: String, edge: DerivedFrom, modelNode: BaseModelNode, before: JsObject, after: JsObject, rangePatch: RangePatch) extends SyncDiff { override def newValue = Some(after) }
  case class ErrorEvaluating(edge: DerivedFrom, error: String, location: AstDebugLocation) extends SyncDiff {
    override def isError: Boolean = true
    private def message = s""""${error}" encountered when calculating patch"""
    override def toString: String = s""""${message}. Check location $location"""
    def asJson: JsValue = JsObject(Seq(
      "message" -> JsString(message),
      "locations" -> JsArray(Seq(JsString(location.toString)))
    ))

  }

}
