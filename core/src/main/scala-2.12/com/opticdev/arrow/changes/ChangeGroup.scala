package com.opticdev.arrow.changes

import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import JsonImplicits.changeGroupFormat
import com.opticdev.arrow.changes.evaluation.{BatchedChanges, Evaluation}
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject

import scala.util.Try

case class ChangeGroup(changes: OpticChange*) {

  def evaluate(sourcegear: SourceGear, project: Option[OpticProject] = None)(implicit nodeKeyStore: NodeKeyStore): BatchedChanges = {
    Evaluation.forChangeGroup(this, sourcegear, project)
  }

  def evaluateAndWrite(sourcegear: SourceGear, project: Option[OpticProject] = None)(implicit nodeKeyStore: NodeKeyStore, autorefreshes: Boolean) : Try[BatchedChanges] = Try {
    val evaluated: BatchedChanges = evaluate(sourcegear, project)

    //create files if they do not exist
    evaluated.stagedFiles.keys.foreach(file => {
      if (!file.exists) {
        require(file.isChildOf(project.get.baseDirectory), s"Optic will not create file '${file.pathAsString}' because it is outside of this project")
        file.createIfNotExists(asDirectory = false, createParents = true)
      }
    })

    if (evaluated.isSuccess) {
      if (!autorefreshes) {
        evaluated.flushToDisk
      }

      evaluated
    } else {
      throw new Exception("Changes could not be applied: "+ evaluated.errors.map(_.getMessage).mkString(", "))
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