package sourcegear.accumulate

import cognitro.parsers.GraphUtils.BaseNode
import play.api.libs.json.{JsArray, JsObject}
import sdk.descriptions.{SchemaComponent, SchemaId}
import sourcegear.gears.helpers.{FlattenModelFields, LocationEvaluation, ModelField}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import sourcegear.graph.GraphImplicits._

sealed trait Listener {
  def collect()(implicit astGraph: Graph[BaseNode, LkDiEdge])
  val schema: SchemaId
}

case class MapSchemaListener(schemaComponent: SchemaComponent, mapToSchema: SchemaId) extends Listener {
  override val schema = schemaComponent.schema
  override def collect()(implicit astGraph: Graph[BaseNode, LkDiEdge]): Unit = {

    val mapToNodes = astGraph.modelNodes.ofType(mapToSchema)
    val targetNodes = astGraph.modelNodes.ofType(schema)

    mapToNodes.foreach(instance=> {
      val astRoot = instance.astRoot
      val addToNodes = targetNodes
        .filter(n=> LocationEvaluation.matches(schemaComponent.location, n.astRoot, astRoot))
        .toVector
        .sortBy(_.astRoot.range._1)

      val modelFields = ModelField(schemaComponent.propertyPath, JsArray(addToNodes.map(_.value)))

      val newModel = FlattenModelFields.flattenFields(Set(modelFields), instance.value)

      instance.silentUpdate(newModel)
    })

  }
}
