package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.arrow.changes.evaluation.ChangeResult
import com.opticdev.arrow.changes.location.{InsertLocation, RawPosition}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.TransformationChanges
import com.opticdev.core.sourcegear.Gear
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsObject, JsString, JsValue, Json}

sealed trait OpticChange {
  def asJson : JsValue
  def schemaOption : Option[Schema] = None
}

/* Updates an existing model found in the code by an ID  */
//case class UpdateModel(modelNodeId: String, newValue: JsObject) extends OpticChange {
//  def asJson : JsValue = ???
//
//}

/* Inserts model somewhere in code */
case class InsertModel( schema: Schema,
                        gearId: Option[String] = None,
                        value: JsObject, atLocation:
                        Option[InsertLocation]
                      ) extends OpticChange {
  import JsonImplicits.insertModelFormat
  def asJson : JsValue = Json.toJson[InsertModel](this)

  override def schemaOption = Some(schema)
}

case class RunTransformation(transformationChanges: TransformationChanges,
                             inputValue: JsObject,
                             gearOptions: Seq[GearOption],
                             gearId: Option[String] = None,
                             locationOptions: Seq[InsertLocation] = Seq(),
                             location: Option[InsertLocation] = None
                            ) extends OpticChange {
  val generatedTransformationSchema : Schema = null
  import JsonImplicits.opticChangeFormat
  override def asJson = Json.toJson[OpticChange](this)
}

case class RawInsert(content: String, position: RawPosition) extends OpticChange {
  import JsonImplicits.rawInsertFormat
  def asJson : JsValue = Json.toJson[RawInsert](this)
}

case class ClearSearchLines(file: File, prefixPattern: String = "^\\s*\\/\\/\\/.*") extends OpticChange {
  import JsonImplicits.clearSearchLinesFormat
  val regex = prefixPattern.r
  override def asJson : JsValue = Json.toJson[ClearSearchLines](this)
}