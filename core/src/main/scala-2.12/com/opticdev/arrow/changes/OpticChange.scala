package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.arrow.changes.evaluation.ChangeResult
import com.opticdev.arrow.changes.location.{InsertLocation, RawPosition}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.TransformationChanges
import com.opticdev.core.sourcegear.CompiledLens
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
import JsonImplicits.opticChangeFormat
import com.opticdev.arrow.results.ModelOption
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.sourcegear.sync.{FilePatch, FilePatchTrait, SyncPatch}
import com.opticdev.parsers.graph.CommonAstNode

sealed trait OpticChange {
  def asJson = Json.toJson[OpticChange](this)
  def schemaOption : Option[Schema] = None
}

/* Updates an existing model found in the code by an ID  */
//case class UpdateModel(modelNodeId: String, newValue: JsObject) extends OpticChange {
//  def asJson : JsValue = ???
//
//}

/* Inserts model somewhere in code */
case class InsertModel(schema: Schema,
                       lensId: Option[String] = None,
                       value: JsObject,
                       atLocation: Option[InsertLocation]
                      ) extends OpticChange {
  override def schemaOption = Some(schema)
}

case class RunTransformation(transformationChanges: TransformationChanges,
                             inputValue: Option[JsObject],
                             askSchema: JsObject,

                             lensOptions: Seq[LensOption],
                             lensId: Option[String],

                             locationOptions: Seq[InsertLocation],
                             location: Option[InsertLocation],

                             answers: Option[JsObject],

                             objectSelection: Option[String],
                             objectOptions: Option[Seq[ModelOption]]
                            ) extends OpticChange {
  override def asJson = Json.toJson[OpticChange](this)
}


case class RawInsert(content: String, position: RawPosition) extends OpticChange

case class ClearSearchLines(file: File, prefixPattern: String = "^\\s*\\/\\/\\/.*") extends OpticChange {
  import JsonImplicits.clearSearchLinesFormat
  val regex = prefixPattern.r
}

case class PutUpdate(id: String, newModel: JsObject) extends OpticChange

case class FileContentsUpdate(file: File, originalFileContents: String, newFileContents: String) extends OpticChange with FilePatchTrait