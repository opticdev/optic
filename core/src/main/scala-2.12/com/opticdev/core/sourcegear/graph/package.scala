package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.common.graph.BaseNode
import play.api.libs.json.{JsValue, Json}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

package object graph {

  trait AstProjection extends BaseNode {
    val id : String = null
    def isModel : Boolean = this.isInstanceOf[BaseModelNode]
    def isObject : Boolean = this.isInstanceOf[ObjectNode]
  }

  type ProjectGraph = Graph[AstProjection, LkDiEdge]
  type SyncGraph = ProjectGraph


  implicit val namedModelFormat = Json.format[NamedModel]
  case class NamedModel(name: String, schemaFull: Option[String], id: String) {
    def toJson : JsValue = Json.toJson[NamedModel](this)
  }

  implicit val namedFileFormat = Json.format[NamedFile]
  case class NamedFile(name: String, path: String) {
    def toJson : JsValue = Json.toJson[NamedFile](this)
  }

  case class FoundExport(local: String, modelNode: BaseModelNode)

}
