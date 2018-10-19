package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.arrow.changes.evaluation.ChangeResult
import com.opticdev.arrow.changes.location.{InsertLocation, RawPosition}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.TransformationChanges
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
import com.opticdev.arrow.results.ModelOption
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.sourcegear.sync.{FilePatch, FilePatchTrait, SyncPatch}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

sealed trait OpticChange {
  def asJson :JsValue
  def schemaOption : Option[OMSchema] = None
  def getTypeField: String = this.getClass.getSimpleName
}

/* Inserts model somewhere in code */
case class InsertModel(schemaRef: SchemaRef,
                       generatorId: Option[String] = None,
                       value: JsObject,
                       atLocation: InsertLocation
                      ) extends OpticChange {
  def schemaFromSG(implicit sourceGear: SourceGear) = {
    sourceGear.findSchema(schemaRef)
  }

  import JsonImplicits.insertModelFormat
  def asJson = Json.toJson[InsertModel](this)
}

case class RunTransformation(transformationRef: TransformationRef,
                             inputValue: JsObject,
                             inputModelId: String,
                             inputModelName: String,
                             generatorId: Option[String],
                             location: InsertLocation,
                             answers: Option[JsObject]) extends OpticChange {

  import JsonImplicits.runTransformationFormat
  def asJson = Json.toJson[RunTransformation](this)
  def transformationFromSG(implicit sourceGear: SourceGear) = {
    sourceGear.findTransformation(transformationRef)
  }
}


case class RawInsert(content: String, position: RawPosition) extends OpticChange {
  import JsonImplicits.rawInsertFormat
  def asJson = Json.toJson[RawInsert](this)
}

case class ClearSearchLines(file: File, prefixPattern: String = "^\\s*\\/\\/\\/.*") extends OpticChange {
  import JsonImplicits.clearSearchLinesFormat
  def asJson = Json.toJson[ClearSearchLines](this)
  val regex = prefixPattern.r
}

case class PutUpdate(id: String, newModel: JsObject) extends OpticChange {
  import JsonImplicits.putUpdateFormat
  def asJson = Json.toJson[PutUpdate](this)
}

case class FileContentsUpdate(file: File, originalFileContents: String, newFileContents: String) extends OpticChange with FilePatchTrait {
  import JsonImplicits.fileContentsUpdateFormat
  def asJson = Json.toJson[FileContentsUpdate](this)
}