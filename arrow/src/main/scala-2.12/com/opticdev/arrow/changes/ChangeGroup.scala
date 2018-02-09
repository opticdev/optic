package com.opticdev.arrow.changes

import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import JsonImplicits.changeGroupFormat
import com.opticdev.arrow.changes.evaluation.{BatchedChanges, Evaluation}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject

import scala.util.Try

case class ChangeGroup(changes: OpticChange*) {

  def evaluate(sourcegear: SourceGear): BatchedChanges = {
    Evaluation.forChangeGroup(this, sourcegear)
  }

  def evaluateAndWrite(sourcegear: SourceGear) : Try[BatchedChanges] = Try {
    val evaluated = evaluate(sourcegear)
    if (evaluated.isSuccess) {
      evaluated.flushToDisk
      evaluated
    } else {
      throw new Exception("Changes could not be applied.")
    }
  }

  def asJson : JsValue = Json.toJson[ChangeGroup](this)

  def head = changes.head
  def last = changes.last
  def apply(index: Int) = changes.lift(index)

}

object ChangeGroup {
  def fromJson(jsValue: JsValue) : Try[ChangeGroup] = Try {
    Json.fromJson[ChangeGroup](jsValue).get
  }

  def fromJson(string: String) : Try[ChangeGroup] =
    Try(fromJson(Json.parse(string)).get)
}