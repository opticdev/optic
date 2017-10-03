package com.opticdev.server.http.routes.query
import com.opticdev.core.sdk.descriptions.{ComponentOptions, Description}
import com.opticdev.core.sdk.descriptions.enums.Finders.Finder
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import play.api.libs.json._

sealed trait IsInFile extends QueryComponent
case class In(filePath: String) extends IsInFile {
  //@todo implement
  override def evaluate(linkedModelNode: LinkedModelNode): Boolean = true
}
case class InFiles(files: Set[String]) extends IsInFile {
  //@todo implement
  override def evaluate(linkedModelNode: LinkedModelNode): Boolean = true
}
case object AnyFile extends IsInFile {
  override def evaluate(linkedModelNode: LinkedModelNode): Boolean = true
}


object IsInFile extends Description[IsInFile] {

  implicit val isInFileReads: Reads[IsInFile] = (json: JsValue) => {
    try {
      JsSuccess(fromJson(json))
    } catch {
      case _ => JsError()
    }
  }

  override def fromJson(jsValue: JsValue): IsInFile = {
    jsValue match {
      case _: JsObject if jsValue.as[JsObject].keys == Set("rule") =>
        val rule = (jsValue.as[JsObject] \ "rule").get.as[JsString].value.toLowerCase
        rule match {
          case "any" => AnyFile
          case _ => throw new Error(jsValue+ "is not a supported rule")
        }
      case _: JsString =>
        In(jsValue.as[JsString].value)
      case _: JsArray => {
        val array = jsValue.as[JsArray].value
        if (!array.forall(_.isInstanceOf[JsString])) throw new Error("All filepaths must be strings")
        InFiles(jsValue.as[JsArray].value.map(i => i.as[JsString].value).toSet)
      }
      case _ =>
        throw new Error("Invalid file query component.")
    }
  }
}