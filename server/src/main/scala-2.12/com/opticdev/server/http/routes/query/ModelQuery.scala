package com.opticdev.server.http.routes.query
import com.opticdev.sdk.descriptions.Description
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.parsers.graph.CommonAstNode
import play.api.libs.json.{JsResult, JsValue, Json, Reads}

import scala.util.Try

case class ModelQuery(file: IsInFile = AnyFile, predicates: Vector[ValuePredicate] = Vector()) extends QueryComponent {
  override def evaluate(linkedModelNode: LinkedModelNode[CommonAstNode]): Boolean =
    file.evaluate(linkedModelNode) && predicates.forall(_.evaluate(linkedModelNode))
}

object ModelQuery extends Description[ModelQuery] {
  private implicit val modelQueryReads: Reads[ModelQuery] = Json.reads[ModelQuery]

  override def fromJson(jsValue: JsValue): ModelQuery = {
    import IsInFile._
    import ValuePredicate._
    val modelQuery: JsResult[ModelQuery] = Json.fromJson[ModelQuery](jsValue)
    if (modelQuery.isSuccess) {
      modelQuery.get
    } else {
      throw new Error("Query parsing failed")
    }
  }

  def fromString(string: String): ModelQuery = {
    val jsonParsed = Try(Json.parse(string))
    if (jsonParsed.isSuccess) {
      fromJson(jsonParsed.get)
    } else {
      throw jsonParsed.failed.get
    }
  }
}