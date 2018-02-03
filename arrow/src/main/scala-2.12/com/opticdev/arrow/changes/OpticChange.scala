package com.opticdev.arrow.changes

import com.opticdev.arrow.changes.location.{InsertLocation, RawPosition}
import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
sealed trait OpticChange {
  def execute : ChangeResult
  def asJson : JsValue
}

/* Updates an existing model found in the code by an ID  */
case class UpdateModel(modelNodeId: String, newValue: JsObject) extends OpticChange {
  override def execute = ???
  def asJson : JsValue = ???

}

/* Inserts model somewhere in code */
case class InsertModel(schemaRef: SchemaRef, value: JsObject, atLocation: InsertLocation) extends OpticChange {
  import JsonImplicits.insertModelFormat
  override def execute = ???
  def asJson : JsValue = Json.toJson[InsertModel](this)
}

case class RawInsert(content: String, position: RawPosition) extends OpticChange {
  import JsonImplicits.rawInsertFormat
  override def execute = ???
  def asJson : JsValue = Json.toJson[RawInsert](this)

}