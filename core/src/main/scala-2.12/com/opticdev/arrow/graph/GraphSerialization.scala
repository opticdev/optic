package com.opticdev.arrow.graph

import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.sdk.descriptions.transformation.Transformation
import play.api.libs.json._
import scalax.collection.GraphEdge.UnDiEdge
import scalax.collection.edge.LkDiEdge

import scala.reflect.ClassTag
import scala.util.Try

object GraphSerialization {
  def serialize(knowledgeGraph: KnowledgeGraph)(implicit sourceGear: SourceGear) : JsObject = {

    val noesAsJson =
    knowledgeGraph.nodes.toSeq.map {
      case (node) => jsonFromNode(node)
    }

    val edgesAsJson = knowledgeGraph.edges.toSeq.map(e=> {

      if (e.isDirected) {

        val transformation = e.label.asInstanceOf[Transformation]

        import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._

        val fromName = Try(sourceGear.findSchema(transformation.resolvedInput).get.name).getOrElse(transformation.input.id)
        val toName = Try(JsString(sourceGear.findSchema(transformation.resolvedOutput.get).get.name)).getOrElse(transformation.output.map(i=> JsString(i.id)).getOrElse(JsNull))

        JsObject(Seq(
          "from" -> JsString(e.from.value.id),
          "fromName" -> JsString(fromName),
          "toName" -> toName,
          "to" -> JsString(e.to.value.id),
          "label" -> JsObject(Seq(
            "name" -> JsString(transformation.yields),
            "packageFull" -> JsString(transformation.packageId.full),
          )),
          "transformationRef" -> JsString(transformation.transformationRef.full),
          "isTransformation" -> JsBoolean(true)
        ))

      } else {
        JsObject(Seq(
          "n1" -> JsString(e.nodes.head.id),
          "n2" -> JsString(e.nodes.last.id),
        ))
      }

    })

    JsObject(Seq(
      "nodes" -> JsArray(noesAsJson),
      "edges" -> JsArray(edgesAsJson)
    ))
  }

  def jsonFromNode(sGNode: SGNode) : JsObject = sGNode match {
    case g: LensNode => JsObject(Seq(
      "id" -> JsString(g.id),
      "name" -> g.gear.name.map(JsString).getOrElse(JsString(g.gear.lensRef.id)),
      "packageFull" -> JsString(g.gear.lensRef.packageRef.get.full),
      "internal" -> JsBoolean(g.gear.internal),
      "priority" -> JsNumber(g.gear.priority),
      "type" -> JsString("lens")
    ))
    case s: SchemaNode => JsObject(Seq(
      "id" -> JsString(s.id),
      "name" -> JsString(s.schema.name),
      "packageFull" -> JsString(s.schema.schemaRef.packageRef.get.full),
      "type" -> JsString("schema")
    ))
  }

}
